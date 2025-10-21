import api from './api';

export interface CreateEmployeeRequest {
  employeeNumber: string;
  name: string;
  surname: string;
  birthDate: string;
  salary: number;
  role: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  managerId?: number;
}

export interface CreateEmployeeResponse {
  id: number;
  employeeNumber: string;
  name: string;
  surname: string;
  birthDate: string;
  salary: string;
  role: string;
  email: string | null;
  phoneNumber: string | null;
  department: string | null;
  managerId: number | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  userCredentials?: {
    email: string;
    temporaryPassword: string;
    role: string;
    message: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const employeeService = {
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
    const response = await api.post('/api/employees', employeeData);
    return response.data;
  },

  async getAvailableRolesForUser(): Promise<string[]> {
    const response = await api.get('/api/employees/available-roles');
    return response.data;
  },
};
