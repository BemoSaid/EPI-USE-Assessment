import { useAuthContext } from '../context/AuthContext';

// Simple hook to use auth context
export const useAuth = () => {
  return useAuthContext();
};