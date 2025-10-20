// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES } from '../../utils/constants';

interface RegisterFormProps {
  onToggleMode?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VIEWER' as 'ADMIN' | 'VIEWER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate form locally - no loading state yet
    if (!validateForm()) {
      showToast('Please fill in all required fields correctly.', 'warning');
      return;
    }

    // Only start loading after validation passes
    setIsSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      showToast('Account created successfully!', 'success');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Registration failed';
        if (message.includes('email')) {
          showToast('Email already exists. Please use a different email.', 'error');
          setErrors({ 
            email: 'Email already exists' 
          });
        } else {
          showToast(message, 'error');
          setErrors({ 
            general: message 
          });
        }
      } else {
        showToast('Registration failed. Please try again.', 'error');
        setErrors({ 
          general: 'Registration failed. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter your full name"
          disabled={isSubmitting}
          autoComplete="name"
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          disabled={isSubmitting}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isSubmitting}
            autoComplete="new-password"
            helperText="Must be at least 6 characters"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-[#5F9EA0] hover:text-[#3A6F6F] transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-[#5F9EA0] hover:text-[#3A6F6F] transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#3A6F6F] mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 border-2 border-[#B2D8D8] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] bg-white text-[#3A6F6F] transition-all duration-200"
          >
            <option value={USER_ROLES.VIEWER}>Viewer (Read-only access)</option>
            <option value={USER_ROLES.ADMIN}>Admin (Full access)</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 mt-8"
      >
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>

      {onToggleMode && (
        <div className="text-center mt-6">
          <p className="text-sm text-[#5F9EA0]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-[#3A6F6F] hover:text-[#5F9EA0] focus:outline-none focus:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </form>
  );
};