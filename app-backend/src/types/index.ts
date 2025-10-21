import { Request } from 'express';
import { Role, UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface CreateEmployeeDto {
  employeeNumber: string;
  name: string;
  surname: string;
  birthDate: string;
  salary: number;
  role: Role;
  email?: string;
  phoneNumber?: string;
  department?: string;
  profileUrl?: string;
  managerId?: number;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeSearchFilters {
  name?: string;
  surname?: string;
  role?: Role;
  department?: string;
  managerId?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  employeeId?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}