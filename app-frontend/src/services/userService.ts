import api from './api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'VIEWER';
}

export interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export const userService = {
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await api.post('/api/auth/create-user', userData);
    return response.data;
  },
};