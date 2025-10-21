import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDto, LoginDto, AuthenticatedRequest } from "../types/index.js";
import prisma from "../config/database.js";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role = "ADMIN" }: CreateUserDto = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          error: "Email, password, and name are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginDto = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }

  async me(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has an associated employee record
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id },
        select: {
          role: true,
          name: true,
          surname: true,
          department: true,
        },
      });

      const responseData = {
        ...user,
        employee: employee ? {
          role: employee.role,
          name: employee.name,
          surname: employee.surname,
          department: employee.department,
        } : null,
      };

      res.json(responseData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  }
  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        email,
        password,
        name,
        role = "VIEWER",
        employeeId,
      }: CreateUserDto = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          error: "Email, password, and name are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      let employee = null;
      if (employeeId) {
        employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          include: { user: true },
        });

        if (!employee) {
          return res.status(400).json({ error: "Employee not found" });
        }

        if (employee.user) {
          return res.status(400).json({ 
            error: "Employee already has a linked user account" 
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      if (employeeId && employee) {
        await prisma.employee.update({
          where: { id: employeeId },
          data: { userId: user.id },
        });

        employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: {
            id: true,
            name: true,
            surname: true,
            employeeNumber: true,
            role: true,
            department: true,
          },
        });
      }

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employee: employee,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async linkUserToEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, employeeId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required",
        });
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { employee: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!employeeId) {
        if (user.employee) {
          await prisma.employee.update({
            where: { id: user.employee.id },
            data: { userId: null },
          });
        }

        return res.json({
          message: "User unlinked from employee successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            employee: null,
          },
        });
      }

      // Find the target employee
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true },
      });

      if (!employee) {
        return res.status(400).json({ error: "Employee not found" });
      }

      if (employee.user && employee.user.id !== userId) {
        return res.status(400).json({
          error: "Employee is already linked to another user",
        });
      }

      if (user.employee) {
        await prisma.employee.update({
          where: { id: user.employee.id },
          data: { userId: null },
        });
      }

      await prisma.employee.update({
        where: { id: employeeId },
        data: { userId: user.id },
      });

      const updatedEmployee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          name: true,
          surname: true,
          employeeNumber: true,
          role: true,
          department: true,
        },
      });

      res.json({
        message: "User linked to employee successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employee: updatedEmployee,
        },
      });
    } catch (error) {
      console.error("Link user to employee error:", error);
      res.status(500).json({ error: "Failed to link user to employee" });
    }
  }
}
