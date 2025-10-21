import api from './api';

export interface DashboardStats {
  totalEmployees: number;
  departmentsCount: number;
  topManagers: Array<{
    id: number;
    name: string;
    role: string;
    department: string | null;
    subordinatesCount: number;
  }>;
  latestHires: Array<{
    id: number;
    name: string;
    role: string;
    department: string | null;
    hiredDate: string;
  }>;
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/api/employees/dashboard-stats');
    return response.data;
  },
};
