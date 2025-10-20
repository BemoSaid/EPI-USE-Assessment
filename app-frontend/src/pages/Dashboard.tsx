// src/pages/Dashboard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Users,
  UserPlus,
  Settings,
  LogOut,
  Building2,
  BarChart3,
  Shield,
  Eye,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-[#F0F9F9] shadow-sm border-b-2 border-[#B2D8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/EH_background.png"
                alt="Employee Hierarchy Logo"
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-semibold text-[#3A6F6F]">
                Employee Hierarchy
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[#3A6F6F]">
                {isAdmin ? (
                  <Shield className="h-4 w-4 text-[#5F9EA0]" />
                ) : (
                  <Eye className="h-4 w-4 text-[#5F9EA0]" />
                )}
                <span className="font-medium">{user.name}</span>
                <span className="text-[#B2D8D8]">({user.role})</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 border-[#B2D8D8] text-[#3A6F6F] hover:bg-[#F0F9F9]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-gray-300">
            {isAdmin
              ? "Manage your organization's employee hierarchy and user accounts."
              : "View and explore your organization's employee hierarchy."}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* View Employees */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#5F9EA0]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#5F9EA0] rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#3A6F6F] mb-1">
                  Employee Directory
                </h3>
                <p className="text-sm text-[#5F9EA0] mb-3">
                  Browse and search through all employees in the organization
                </p>
                <Button size="sm" variant="outline">
                  View Employees
                </Button>
              </div>
            </div>
          </Card>

          {/* Organization Chart */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#5F9EA0]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#6FB7B7] rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#3A6F6F] mb-1">
                  Organization Chart
                </h3>
                <p className="text-sm text-[#5F9EA0] mb-3">
                  View the complete organizational hierarchy structure
                </p>
                <Button size="sm" variant="outline">
                  View Hierarchy
                </Button>
              </div>
            </div>
          </Card>

          {/* Admin Only: Create User */}
          {isAdmin && (
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#5F9EA0]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-[#5F9EA0] to-[#6FB7B7] rounded-xl">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#3A6F6F] mb-1">
                    Create New User
                  </h3>
                  <p className="text-sm text-[#5F9EA0] mb-3">
                    Add new users to the employee management system
                  </p>
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = "/register")}
                  >
                    Add User
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card title="System Status" className="border-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">
                  Database Connection
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6FB7B7] rounded-full"></div>
                  <span className="text-sm text-[#3A6F6F] font-medium">
                    Connected
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6FB7B7] rounded-full"></div>
                  <span className="text-sm text-[#3A6F6F] font-medium">
                    Online
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">
                  Your Access Level
                </span>
                <span className="text-sm font-semibold text-[#3A6F6F]">
                  {isAdmin ? "Administrator" : "Viewer"}
                </span>
              </div>
            </div>
          </Card>

          {/* User Info */}
          <Card title="Your Account" className="border-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">Email</span>
                <span className="text-sm font-medium text-[#3A6F6F]">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">Role</span>
                <span className="text-sm font-semibold text-[#5F9EA0]">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F9EA0]">Member Since</span>
                <span className="text-sm font-medium text-[#3A6F6F]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-[#B2D8D8]">
                  <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
