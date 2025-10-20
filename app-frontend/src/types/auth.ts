export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

// Match backend AuthResponse
export interface AuthResponse {
  token: string;
  user: User;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request 
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'VIEWER';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}