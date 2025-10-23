import { Response } from "express";
import {
  AuthenticatedRequest,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../types/index.js";
import { Role } from "@prisma/client";
import prisma from "../config/database.js";
import crypto from "crypto";
import fetch from "node-fetch";
import bcrypt from "bcryptjs";
import { Parser as Json2CsvParser } from 'json2csv';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });

export class EmployeeController {
  // Role hierarchy - lower numbers = higher authority
  private roleHierarchy = {
    CEO: 1,
    CTO: 2,
    DIRECTOR: 3,
    SENIOR_MANAGER: 4,
    MANAGER: 5,
    TEAM_LEAD: 6,
    SENIOR_EMPLOYEE: 7,
    JUNIOR_EMPLOYEE: 8,
    INTERN: 9,
  } as const;

  private mapEmployeeRoleToUserRole(employeeRole: Role): "ADMIN" | "VIEWER" {
    const adminRoles: Role[] = ["CEO", "CTO", "DIRECTOR", "SENIOR_MANAGER", "MANAGER"];
    return adminRoles.includes(employeeRole) ? "ADMIN" : "VIEWER";
  }

  private generateDefaultPassword(employeeNumber: string, surname: string): string {
    // Ensure at least 3 chars from surname, pad with 'x' if needed
    let surnamePrefix = surname.substring(0, 3).toLowerCase();
    if (surnamePrefix.length < 3) surnamePrefix = surnamePrefix.padEnd(3, 'x');
    // Ensure employeeNumber is at least 3 chars
    let empNumPart = employeeNumber.replace(/[^a-zA-Z0-9]/g, '');
    if (empNumPart.length < 3) empNumPart = empNumPart.padEnd(3, '0');
    // Add a special char and a digit for complexity
    return `${surnamePrefix}${empNumPart}!9`;
  }

  private async canCreateEmployeeRole(creatorUserId: string, targetRole: Role): Promise<boolean> {
    const creatorEmployee = await prisma.employee.findFirst({
      where: { userId: creatorUserId },
      select: { role: true }
    });

    if (!creatorEmployee) {
      return targetRole !== "CEO";
    }

    const creatorRank = this.roleHierarchy[creatorEmployee.role];
    const targetRank = this.roleHierarchy[targetRole];

    return targetRank > creatorRank;
  }

  private canBeManager(managerRole: Role, subordinateRole: Role): boolean {
    const managerRank = this.roleHierarchy[managerRole];
    const subordinateRank = this.roleHierarchy[subordinateRole];

    return managerRank < subordinateRank;
  }

  private shouldHaveNoManager(role: Role): boolean {
    return role === "CEO"; 
  }

  constructor() {
    this.getAllEmployees = this.getAllEmployees.bind(this);
    this.getEmployeeById = this.getEmployeeById.bind(this);
    this.createEmployee = this.createEmployee.bind(this);
    this.updateEmployee = this.updateEmployee.bind(this);
    this.deleteEmployee = this.deleteEmployee.bind(this);
    this.getHierarchy = this.getHierarchy.bind(this);
    this.getDepartments = this.getDepartments.bind(this);
    this.getPotentialManagers = this.getPotentialManagers.bind(this);
    this.getDashboardStats = this.getDashboardStats.bind(this);
    this.getAvailableEmployees = this.getAvailableEmployees.bind(this);
    this.getAvailableRoles = this.getAvailableRoles.bind(this);
    this.promoteEmployee = this.promoteEmployee.bind(this);
    this.exportEmployeesCsv = this.exportEmployeesCsv.bind(this);
    this.importEmployeesCsv = this.importEmployeesCsv.bind(this);
    this.getEmployeeForCurrentUser = this.getEmployeeForCurrentUser.bind(this);
  }
  // Gravatar URLs
  // private getGravatarUrl(email: string, size: number = 200): string {
  //     if (!email) return '';
  //     const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  //     return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
  // }

  private async getGravatarUrl(
    email: string,
    size: number = 200
  ): Promise<string> {
    if (!email) return "";

    const hash = crypto
      .createHash("md5")
      .update(email.toLowerCase().trim())
      .digest("hex");
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;

    try {
      // Check if Gravatar account exists
      const response = await fetch(gravatarUrl, { method: "HEAD" });

      if (response.status === 200) {
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
      }
      // if does not exist return null
      return "";
    } catch (error) {
      return "";
    }
  }

  // search, filter, and sort
  async getAllEmployees(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        search,
        role,
        department,
        managerId,
        sortField = "employeeNumber",
        sortDirection = "asc",
        page = 1,
        limit = 50,
      } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { surname: { contains: search as string, mode: "insensitive" } },
          {
            employeeNumber: { contains: search as string, mode: "insensitive" },
          },
          { email: { contains: search as string, mode: "insensitive" } },
          { department: { contains: search as string, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role as Role;
      }

      if (department) {
        where.department = {
          contains: department as string,
          mode: "insensitive",
        };
      }

      if (managerId) {
        where.managerId = parseInt(managerId as string);
      }

      const orderBy: any = {};
      orderBy[sortField as string] = sortDirection;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const total = await prisma.employee.count({ where });

      const employees = await prisma.employee.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              surname: true,
              employeeNumber: true,
              role: true,
            },
          },
          subordinates: {
            select: {
              id: true,
              name: true,
              surname: true,
              employeeNumber: true,
              role: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      });

      // Gravatar URLs
      const employeesWithGravatar = await Promise.all(
        employees.map(async (emp) => {
          const gravatarUrl = await this.getGravatarUrl(emp.email || "");
          return {
            ...emp,
            ...(gravatarUrl && { gravatarUrl }), // Only add if exists
          };
        })
      );

      res.json({
        employees: employeesWithGravatar,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }

  // Get employee by ID
  async getEmployeeById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid or missing employee id" });
      }
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              surname: true,
              employeeNumber: true,
              role: true,
            },
          },
          subordinates: {
            select: {
              id: true,
              name: true,
              surname: true,
              employeeNumber: true,
              role: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      // Add Gravatar URL only if it exists
      const gravatarUrl = await this.getGravatarUrl(employee.email || "");
      const employeeResponse = {
        ...employee,
        ...(gravatarUrl && { gravatarUrl }), // Only add if exists
      };
      res.json(employeeResponse);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  }

  // Create new employee
  async createEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const employeeData: CreateEmployeeDto = req.body;

      // Validation
      if (
        !employeeData.name ||
        !employeeData.surname ||
        !employeeData.email ||
        !employeeData.phoneNumber
      ) {
        return res.status(400).json({
          error: "Name, surname, email, and phone number are required",
        });
      }

      // Check hierarchical role creation permissions
      const canCreate = await this.canCreateEmployeeRole(req.user!.id, employeeData.role);
      if (!canCreate) {
        return res.status(403).json({
          error: "You don't have permission to create an employee with this role",
        });
      }

      // Validate that employee is not their own manager
      if (
        employeeData.managerId &&
        employeeData.managerId.toString() === req.body.id
      ) {
        return res
          .status(400)
          .json({ error: "Employee cannot be their own manager" });
      }

      // Auto-handle CEO role - CEOs cannot have managers
      if (this.shouldHaveNoManager(employeeData.role)) {
        delete employeeData.managerId;
      } else if (req.user?.role !== 'ADMIN') {
        // For non-admins, always set managerId to current user's employee id
        const currentEmployee = await prisma.employee.findFirst({ where: { userId: req.user!.id }, select: { id: true } });
        if (currentEmployee) {
          employeeData.managerId = currentEmployee.id;
        } else {
          return res.status(400).json({ error: "Current user does not have an associated employee record" });
        }
      }

      // Check if employee number already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { employeeNumber: employeeData.employeeNumber },
      });

      if (existingEmployee) {
        return res
          .status(400)
          .json({ error: "Employee number already exists" });
      }

      // check if email already exists
      if (employeeData.email) {
        const existingEmailEmployee = await prisma.employee.findUnique({
          where: { email: employeeData.email },
        });

        if (existingEmailEmployee) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      if (employeeData.managerId) {
        const manager = await prisma.employee.findUnique({
          where: { id: employeeData.managerId },
        });

        if (!manager) {
          return res.status(400).json({ error: "Manager not found" });
        }

        // Validate hierarchical manager relationship
        if (!this.canBeManager(manager.role, employeeData.role)) {
          return res.status(400).json({
            error: `A ${manager.role} cannot manage a ${employeeData.role}. Please select an appropriate manager.`,
          });
        }
      }



      // Automatically create user account for the employee
      let user = null;
      if (employeeData.email) {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: employeeData.email },
        });

        if (existingUser) {
          return res.status(400).json({ 
            error: "A user account with this email already exists" 
          });
        }

        // Generate default password and determine user role
        const defaultPassword = this.generateDefaultPassword(
          employeeData.employeeNumber, 
          employeeData.surname
        );
        const userRole = this.mapEmployeeRoleToUserRole(employeeData.role);
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Create user first
        user = await prisma.user.create({
          data: {
            email: employeeData.email,
            password: hashedPassword,
            name: `${employeeData.name} ${employeeData.surname}`,
            role: userRole,
          },
        });
      }

      // Auto-generate employeeNumber if not provided
      let employeeNumber = employeeData.employeeNumber;
      if (!employeeNumber) {
        const lastEmployee = await prisma.employee.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
        employeeNumber = `E${(lastEmployee?.id ?? 0) + 1}`;
      }

      // Create employee and link to user if user was created
      const employee = await prisma.employee.create({
        data: {
          ...employeeData,
          employeeNumber, // Use generated or provided employeeNumber
          birthDate: new Date(employeeData.birthDate),
          userId: user?.id || null,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              surname: true,
              employeeNumber: true,
              role: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Add Gravatar URL only if it exists
      const gravatarUrl = await this.getGravatarUrl(employee.email || "");
      
      // Prepare response with user credentials if a user was created
      const employeeResponse: any = {
        ...employee,
        ...(gravatarUrl && { gravatarUrl }), 
      };

      if (user) {
        const defaultPassword = this.generateDefaultPassword(
          employeeData.employeeNumber, 
          employeeData.surname
        );
        
        employeeResponse.userCredentials = {
          email: user.email,
          temporaryPassword: defaultPassword,
          role: user.role,
          message: "User account created automatically. Please share these credentials with the employee and ask them to change the password on first login."
        };
      }

      res.status(201).json(employeeResponse);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  }
  // Promote employee
  async promoteEmployee(req: any, res: Response) {
    try {
      const { id } = req.params;
      const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
      if (!employee) return res.status(404).json({ error: 'Employee not found' });
      // Get current user's role
      const userId = req.user?.id;
      const currentUser = await prisma.employee.findFirst({ where: { userId }, select: { role: true } });
      if (!currentUser) return res.status(403).json({ error: 'No permission to promote (not an employee)' });
      const currentUserRank = this.roleHierarchy[currentUser.role];
      // Promotion logic
      const roles: Role[] = [
        'INTERN', 'JUNIOR_EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'CTO', 'CEO'
      ];
      const currentIndex = roles.indexOf(employee.role);
      if (currentIndex === -1 || currentIndex === roles.length - 1) {
        return res.status(400).json({ error: 'Cannot promote further' });
      }
      const newRole = roles[currentIndex + 1];
      const newRoleRank = this.roleHierarchy[newRole as Role];
      // Debug logging for promotion logic
      console.log('Promote attempt:', {
        currentUserRole: currentUser.role,
        currentUserRank,
        employeeRole: employee.role,
        newRole,
        newRoleRank
      });
      // Only allow promotion if new role rank >= current user's rank (lower authority)
      if (newRoleRank < currentUserRank) {
        return res.status(403).json({ error: `You do not have permission to promote to ${newRole}` });
      }
      const updated = await prisma.employee.update({ where: { id: employee.id }, data: { role: newRole as Role } });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to promote employee' });
    }
  }

  // Update employee
  async updateEmployee(req: any, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body ?? {};
      // Defensive: ensure data is a plain object
      if (typeof data !== 'object' || data === null) {
        return res.status(400).json({ error: 'Invalid data for update' });
      }
      const updated = await prisma.employee.update({ where: { id: Number(id) }, data });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }

  // Delete employee
  async deleteEmployee(req: any, res: Response) {
    try {
      const { id } = req.params;
      const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
      if (!employee) return res.status(404).json({ error: 'Employee not found' });
      // Get current user's role
      const userId = req.user?.id;
      const currentUser = await prisma.employee.findFirst({ where: { userId }, select: { role: true } });
      if (!currentUser) return res.status(403).json({ error: 'No permission to delete (not an employee)' });
      const currentUserRank = this.roleHierarchy[currentUser.role];
      const employeeRank = this.roleHierarchy[employee.role];
      // Only allow delete if employee's rank is greater than current user's rank (lower authority)
      if (employeeRank <= currentUserRank) {
        return res.status(403).json({ error: `You do not have permission to delete a user with role ${employee.role}` });
      }
      await prisma.employee.delete({ where: { id: Number(id) } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  }

  async getHierarchy(req: AuthenticatedRequest, res: Response) {
    try {
      const buildHierarchy = async (
        managerId: number | null = null
      ): Promise<any[]> => {
        const employees = await prisma.employee.findMany({
          where: { managerId },
          include: {
            subordinates: true,
          },
          orderBy: [{ role: "asc" }, { name: "asc" }],
        });

        const result = [];
        for (const employee of employees) {
          const subordinates = await buildHierarchy(employee.id);
          const gravatarUrl = await this.getGravatarUrl(employee.email || "");
          result.push({
            ...employee,
            ...(gravatarUrl && { gravatarUrl }), 
            children: subordinates,
          });
        }
        return result;
      };

      const hierarchy = await buildHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
      res.status(500).json({ error: "Failed to fetch hierarchy" });
    }
  }
  // Get departments list
  async getDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const departments = await prisma.employee.findMany({
        where: {
          department: {
            not: null,
          },
        },
        select: {
          department: true,
        },
        distinct: ["department"],
        orderBy: {
          department: "asc",
        },
      });

      const departmentList = departments
        .map((d) => d.department)
        .filter(Boolean);

      res.json(departmentList);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  }

  // Get all potential managers 
  async getPotentialManagers(req: AuthenticatedRequest, res: Response) {
    try {
      const { excludeId } = req.query;

      const where: any = {
        role: {
          in: [
            "CEO",
            "CTO",
            "DIRECTOR",
            "SENIOR_MANAGER",
            "MANAGER",
            "TEAM_LEAD",
          ],
        },
      };

      if (excludeId) {
        where.id = {
          not: parseInt(excludeId as string),
        };
      }

      const managers = await prisma.employee.findMany({
        where,
        select: {
          id: true,
          name: true,
          surname: true,
          employeeNumber: true,
          role: true,
          department: true,
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
      });

      res.json(managers);
    } catch (error) {
      console.error("Error fetching potential managers:", error);
      res.status(500).json({ error: "Failed to fetch potential managers" });
    }
  }



  // Get dashboard statistics
  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const totalEmployees = await prisma.employee.count();

      const departmentsResult = await prisma.employee.findMany({
        where: {
          department: {
            not: null,
          },
        },
        select: {
          department: true,
        },
        distinct: ["department"],
      });
      const departmentsCount = departmentsResult.length;

      const managersWithCounts = await prisma.employee.findMany({
        where: {
          role: {
            in: ["CEO", "CTO", "DIRECTOR", "SENIOR_MANAGER", "MANAGER", "TEAM_LEAD"],
          },
        },
        select: {
          id: true,
          name: true,
          surname: true,
          role: true,
          department: true,
          _count: {
            select: {
              subordinates: true,
            },
          },
        },
        orderBy: {
          subordinates: {
            _count: "desc",
          },
        },
        take: 3,
      });

      const latestHires = await prisma.employee.findMany({
        select: {
          id: true,
          name: true,
          surname: true,
          role: true,
          department: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      const stats = {
        totalEmployees,
        departmentsCount,
        topManagers: managersWithCounts.map(manager => ({
          id: manager.id,
          name: `${manager.name} ${manager.surname}`,
          role: manager.role,
          department: manager.department,
          subordinatesCount: manager._count.subordinates,
        })),
        latestHires: latestHires.map(employee => ({
          id: employee.id,
          name: `${employee.name} ${employee.surname}`,
          role: employee.role,
          department: employee.department,
          hiredDate: employee.createdAt,
        })),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  }

  // Get roles that the current user can create
  async getAvailableRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const creatorEmployee = await prisma.employee.findFirst({
        where: { userId: req.user!.id },
        select: { role: true }
      });

      let availableRoles: Role[] = [];

      if (!creatorEmployee) {
        availableRoles = Object.keys(this.roleHierarchy)
          .filter(role => role !== "CEO") as Role[];
      } else {
        const creatorRank = this.roleHierarchy[creatorEmployee.role];
        availableRoles = Object.entries(this.roleHierarchy)
          .filter(([_, rank]) => rank > creatorRank)
          .map(([role, _]) => role) as Role[];
      }

      availableRoles.sort((a, b) => this.roleHierarchy[a as Role] - this.roleHierarchy[b as Role]);

      res.json(availableRoles);
    } catch (error) {
      console.error("Error fetching available roles:", error);
      res.status(500).json({ error: "Failed to fetch available roles" });
    }
  }

  async getAvailableEmployees(req: AuthenticatedRequest, res: Response) {
    try {
      // Get the current user's employee record
      const userId = req.user?.id;
      let creator = null;
      if (userId) {
        creator = await prisma.employee.findFirst({
          where: { userId },
          select: { id: true, role: true }
        });
      }

      const allEmployees = await prisma.employee.findMany({
        select: {
          id: true,
          name: true,
          surname: true,
          employeeNumber: true,
          role: true,
          department: true,
        },
        orderBy: [
          { name: "asc" },
          { surname: "asc" }
        ],
      });

      let availableEmployees = allEmployees;
      if (creator) {
        // Only allow managers with a higher rank than the creator
        const roleHierarchy = this.roleHierarchy;
        availableEmployees = allEmployees.filter(emp => roleHierarchy[emp.role] < roleHierarchy[creator.role]);
      }

      // Always include the creator as a possible manager
      if (creator && !availableEmployees.some(emp => emp.id === creator.id)) {
        const self = allEmployees.find(emp => emp.id === creator.id);
        if (self) availableEmployees.unshift(self);
      }

      res.json(availableEmployees);
    } catch (error) {
      console.error("Error fetching available employees:", error);
      res.status(500).json({ error: "Failed to fetch available employees" });
    }
  }

  // Export employees as CSV
  async exportEmployeesCsv(req: AuthenticatedRequest, res: Response) {
    try {
      // Accept filters from query params (reuse getAllEmployees logic)
      const {
        search,
        role,
        department,
        managerId,
        sortField = "employeeNumber",
        sortDirection = "asc",
      } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { surname: { contains: search as string, mode: "insensitive" } },
          { employeeNumber: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
          { department: { contains: search as string, mode: "insensitive" } },
        ];
      }
      if (role && typeof role === 'string' && role.trim() !== '') {
        where.role = role as Role;
      }
      if (department && typeof department === 'string' && department.trim() !== '') {
        where.department = { equals: department as string };
      }
      if (managerId && !isNaN(Number(managerId))) {
        where.managerId = Number(managerId);
      }

      const employees = await prisma.employee.findMany({
        where,
        orderBy: { [sortField as string]: sortDirection === "desc" ? "desc" : "asc" },
        select: {
          id: true,
          name: true,
          surname: true,
          employeeNumber: true,
          email: true,
          role: true,
          department: true,
          manager: { select: { email: true } },
        },
      });
      const data = employees.map(e => ({
        ...e,
        managerEmail: e.manager && e.manager.email ? e.manager.email : '',
      }));
      data.forEach(d => { delete (d as any).manager; });
      const fields = ['id', 'name', 'surname', 'employeeNumber', 'email', 'role', 'department', 'managerEmail'];
      const json2csv = new Json2CsvParser({ fields });
      const csv = json2csv.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment('employees.csv');
      return res.send(csv);
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ error: 'Failed to export employees as CSV' });
    }
  }

  // Import employees from CSV
  async importEmployeesCsv(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const filePath = req.file.path;
      const results: any[] = [];
      const summary = { created: 0, updated: 0, userCreated: 0, errors: [] as string[] };
      const stream = fs.createReadStream(filePath)
        .pipe(csvParser());
      for await (const row of stream) {
        try {
          const { name, surname, employeeNumber, email, phoneNumber, role, department, managerEmail, birthDate, salary } = row;
          if (!name || !surname || !employeeNumber || !email || !phoneNumber || !role || !birthDate || !salary) {
            summary.errors.push(`Missing required fields for employeeNumber: ${employeeNumber || 'unknown'}`);
            continue;
          }
          let managerId = undefined;
          if (managerEmail && managerEmail.trim() !== '') {
            const manager = await prisma.employee.findFirst({ where: { email: managerEmail } });
            if (manager) managerId = manager.id;
          }
          const existing = await prisma.employee.findFirst({ where: { employeeNumber } });
          let userId = null;
          if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (!existingUser) {
              const defaultPassword = this.generateDefaultPassword(employeeNumber, surname);
              const userRole = this.mapEmployeeRoleToUserRole(role);
              const hashedPassword = await bcrypt.hash(defaultPassword, 12);
              const user = await prisma.user.create({
                data: {
                  email,
                  password: hashedPassword,
                  name: `${name} ${surname}`,
                  role: userRole,
                },
              });
              userId = user.id;
              summary.userCreated++;
            } else {
              userId = existingUser.id;
            }
          }
          if (existing) {
            await prisma.employee.update({
              where: { id: existing.id },
              data: {
                name,
                surname,
                email,
                role,
                department,
                managerId: managerId ?? null,
                birthDate: new Date(birthDate),
                salary: Number(salary),
                userId: userId ?? existing.userId ?? null,
                phoneNumber
              },
            });
            summary.updated++;
          } else {
            // Auto-generate employeeNumber if not provided
            let empNumber = employeeNumber;
            if (!empNumber) {
              const lastEmployee = await prisma.employee.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
              empNumber = `E${(lastEmployee?.id ?? 0) + 1}`;
            }
            await prisma.employee.create({
              data: {
                name,
                surname,
                employeeNumber: empNumber, // Use generated employeeNumber
                email,
                role,
                department,
                managerId: managerId ?? null,
                birthDate: new Date(birthDate),
                salary: Number(salary),
                userId: userId ?? null,
                phoneNumber
              },
            });
            summary.created++;
          }
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
            summary.errors.push(`Duplicate email: ${row.email || 'unknown'} (row skipped)`);
          } else {
            summary.errors.push('Row error: Invalid or duplicate data. Please check your CSV.');
          }
        }
      }
      fs.unlinkSync(filePath); 
      res.json(summary);
    } catch (error) {
      console.error('CSV import error:', error);
      res.status(500).json({ error: 'Failed to import employees from CSV. Please check your file for duplicate emails or invalid data.' });
    }
  }

  // Get current user's employee record
  async getEmployeeForCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const employee = await prisma.employee.findFirst({ where: { userId }, select: {
        id: true,
        name: true,
        surname: true,
        employeeNumber: true,
        role: true,
        department: true,
        email: true,
        phoneNumber: true,
        profileUrl: true,
        managerId: true,
      }});
      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found for current user' });
      }
      return res.json(employee);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch employee record' });
    }
  }
}
