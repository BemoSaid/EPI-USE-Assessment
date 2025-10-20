// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Storage keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// User roles 
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER'
} as const;

// Employee roles
export const EMPLOYEE_ROLES = {
  CEO: 'CEO',
  CTO: 'CTO',
  DIRECTOR: 'DIRECTOR',
  SENIOR_MANAGER: 'SENIOR_MANAGER',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  SENIOR_EMPLOYEE: 'SENIOR_EMPLOYEE',
  JUNIOR_EMPLOYEE: 'JUNIOR_EMPLOYEE',
  INTERN: 'INTERN'
} as const;