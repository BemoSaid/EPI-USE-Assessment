// src/components/auth/AuthLayout.tsx
import React from "react";
import { Card } from "../ui/Card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section - Only Logo */}
        <div className="text-center">
          {/* Company Logo */}
          <div className="mx-auto mb-1">
            <img
              src="/EH_background.png"
              alt="Employee Hierarchy Logo"
              className="h-21 w-auto mx-auto drop-shadow-[0_3px_4px_rgba(255,255,255,0.15)]"
            />
          </div>
        </div>

        {/* Form Card with Title Inside */}
        <Card
          shadow="xl"
          className="bg-white/95 border border-white/30 rounded-2xl backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          {/* Title and Subtitle inside the card */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-black mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Form content */}
          {children}
        </Card>

        {/* Copyright Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
          </p>
        </div>
      </div>
    </div>
  );
};