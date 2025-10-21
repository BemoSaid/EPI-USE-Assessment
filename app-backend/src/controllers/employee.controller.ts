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

export class EmployeeController {
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
        !employeeData.employeeNumber
      ) {
        return res.status(400).json({
          error: "Name, surname, and employee number are required",
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
      }

      if (employeeData.userId) {
        const user = await prisma.user.findUnique({
          where: { id: employeeData.userId },
        });

        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
      }

      const employee = await prisma.employee.create({
        data: {
          ...employeeData,
          birthDate: new Date(employeeData.birthDate),
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
      const employeeResponse = {
        ...employee,
        ...(gravatarUrl && { gravatarUrl }), // Only add if exists
      };

      res.status(201).json(employeeResponse);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  }
  // Update employee
  async updateEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const updateData: UpdateEmployeeDto = req.body;

      // Validate that employee is not their own manager
      if (updateData.managerId && updateData.managerId === id) {
        return res
          .status(400)
          .json({ error: "Employee cannot be their own manager" });
      }

      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { id },
      });

      if (!existingEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Validate manager exists if provided
      if (updateData.managerId) {
        const manager = await prisma.employee.findUnique({
          where: { id: updateData.managerId },
        });

        if (!manager) {
          return res.status(400).json({ error: "Manager not found" });
        }
      }

      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.birthDate && {
            birthDate: new Date(updateData.birthDate),
          }),
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

      // Add Gravatar URL only if it exists
      const gravatarUrl = await this.getGravatarUrl(
        updatedEmployee.email || ""
      );
      const employeeResponse = {
        ...updatedEmployee,
        ...(gravatarUrl && { gravatarUrl }), 
      };

      res.json(employeeResponse);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  }

  // Delete employee, should be cascading
  async deleteEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);

      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { id },
        include: {
          subordinates: true,
        },
      });

      if (!existingEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Check if employee has subordinates
      if (existingEmployee.subordinates.length > 0) {
        return res.status(400).json({
          error:
            "Cannot delete employee with subordinates. Please reassign subordinates first.",
          subordinateCount: existingEmployee.subordinates.length,
          subordinates: existingEmployee.subordinates.map((s) => ({
            id: s.id,
            name: s.name,
            surname: s.surname,
            employeeNumber: s.employeeNumber,
          })),
        });
      }

      await prisma.employee.delete({
        where: { id },
      });

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  }

  // Recursively get hierarchy tree
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
}
