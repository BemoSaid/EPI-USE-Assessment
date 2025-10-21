import api from './api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'VIEWER';
  employeeId?: number;
}

export interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    employee?: {
      id: number;
      name: string;
      surname: string;
      employeeNumber: string;
      role: string;
      department: string;
    };
    createdAt: string;
  };
}

export interface EmployeeOption {
  id: number;
  name: string;
  surname: string;
  employeeNumber: string;
  role: string;
  department: string | null;
}

export const userService = {
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await api.post('/api/auth/create-user', userData);
    return response.data;
  },

  async getAvailableEmployees(): Promise<EmployeeOption[]> {
    const response = await api.get('/api/employees/available-for-users');
    return response.data;
  },
};