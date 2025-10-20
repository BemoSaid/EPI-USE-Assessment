// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

interface LoginFormProps {
  onToggleMode?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login } = useAuth(); // Remove isLoading from here
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Add local loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await login(formData.email, formData.password);
      showToast('Successfully logged in!', 'success');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.response?.status === 401) {
        showToast('Invalid email or password. Please check your credentials.', 'error');
        setErrors({ 
          general: 'Invalid email or password' 
        });
      } else if (error.response?.status === 404) {
        showToast('User account not found.', 'error');
        setErrors({ 
          general: 'User not found' 
        });
      } else {
        showToast('Login failed. Please try again.', 'error');
        setErrors({ 
          general: 'Login failed. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false); // Always stop loading
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-4">
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
            autoComplete="current-password"
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
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 mt-8"
      >
        <LogIn className="h-4 w-4" />
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      {onToggleMode && (
        <div className="text-center mt-6">
          <p className="text-sm text-[#5F9EA0]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-[#3A6F6F] hover:text-[#5F9EA0] focus:outline-none focus:underline transition-colors"
            >
              Contact your administrator
            </button>
          </p>
        </div>
      )}
    </form>
  );
};