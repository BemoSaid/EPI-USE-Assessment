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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
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

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.put('/api/auth/change-password', passwordData);
    return response.data;
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<{ message: string; user: any }> {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  async refreshGravatarData(email: string): Promise<{ hasGravatar: boolean; profile: any }> {
    // This is a client-side function to check Gravatar data
    const { gravatarService } = await import('./gravatarService');

    const hasGravatar = await gravatarService.checkGravatarExists(email);
    const profile = hasGravatar ? await gravatarService.getGravatarProfile(email) : null;

    return { hasGravatar, profile };
  },
};