import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Register: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admins can access registration page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Create New User"
      subtitle="Add a new user to the employee management system"
    >
      <RegisterForm />
    </AuthLayout>
  );
};