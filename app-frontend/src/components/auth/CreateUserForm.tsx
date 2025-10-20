import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../utils/constants';

export const CreateUserForm: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await userService.createUser({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      showToast(
        `User "${response.user.name}" created successfully! They can now login with their email and password.`,
        'success'
      );
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Create user failed:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.error || 'Failed to create user';
        if (message.includes('email')) {
          setErrors({ 
            email: 'This email is already registered' 
          });
          showToast('This email is already registered', 'error');
        } else {
          showToast(message, 'error');
        }
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to create users', 'error');
        navigate('/dashboard');
      } else {
        showToast('Failed to create user. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter the user's full name"
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
          placeholder="Enter the user's email"
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
            placeholder="Enter a secure password"
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
            placeholder="Confirm the password"
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
            User Role
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
          <p className="text-sm text-[#5F9EA0] mt-1">
            {formData.role === 'ADMIN' 
              ? 'Can view, create, edit, and delete employees and users'
              : 'Can only view employee information'
            }
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};