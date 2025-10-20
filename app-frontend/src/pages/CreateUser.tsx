import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/auth/AuthLayout';
import { CreateUserForm } from '../components/auth/CreateUserForm.tsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CreateUser: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Create New User"
      subtitle="Add a new user to the employee management system"
    >
      <CreateUserForm />
    </AuthLayout>
  );
};