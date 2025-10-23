import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Building2, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { EMPLOYEE_ROLES } from '../utils/constants';
import { employeeService, CreateEmployeeRequest } from '../services/employeeService';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { generateEmployeeCredentialsPDF } from '../lib/generateEmployeeCredentialsPDF';

interface CreateEmployeeData {
  employeeNumber: string;
  name: string;
  surname: string;
  birthDate: string;
  salary: string;
  role: string;
  email: string;
  phoneNumber: string;
  department: string;
  managerId?: string;
}

export const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [managerFieldVisible, setManagerFieldVisible] = useState(true);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  
  const [formData, setFormData] = useState<CreateEmployeeData>({
    employeeNumber: '', // will be set by backend
    name: '',
    surname: '',
    birthDate: '',
    salary: '',
    role: 'JUNIOR_EMPLOYEE',
    email: '',
    phoneNumber: '',
    department: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAvailableRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const roles = await employeeService.getAvailableRolesForUser();
        setAvailableRoles(roles);
        
        if (roles.length > 0 && !roles.includes(formData.role)) {
          setFormData(prev => ({
            ...prev,
            role: roles[roles.length - 1] 
          }));
        }
      } catch (error) {
        console.error('Failed to fetch available roles:', error);
        showToast('Failed to load available roles', 'error');
        // Fall back to all roles if API fails
        setAvailableRoles(Object.values(EMPLOYEE_ROLES));
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchAvailableRoles();
  }, []);

  useEffect(() => {
    // Fetch available managers only if admin
    if (isAdmin) {
      userService.getAvailableEmployees().then(setAvailableManagers);
    }
  }, [isAdmin]);

  useEffect(() => {
    // Fetch current user's employee record for non-admins
    if (!isAdmin) {
      employeeService.getCurrentUserEmployee().then((emp: any) => {
        if (!emp || !emp.id) {
          showToast('Your user account is not linked to an employee record. Please contact an admin.', 'error');
          setCurrentEmployeeId(null);
          setCurrentEmployee(null);
          setFormData(prev => ({ ...prev, managerId: undefined }));
        } else {
          setCurrentEmployeeId(emp.id);
          setCurrentEmployee(emp);
          setFormData(prev => ({ ...prev, managerId: String(emp.id) }));
        }
      }).catch(() => {
        showToast('Could not fetch your employee record. Please contact an admin.', 'error');
        setCurrentEmployeeId(null);
        setCurrentEmployee(null);
        setFormData(prev => ({ ...prev, managerId: undefined }));
      });
    }
  }, [isAdmin, showToast]);

  // DEBUG: Log the current employee record for troubleshooting
  useEffect(() => {
    if (!isAdmin) {
      console.log('Fetched current employee for manager:', currentEmployee);
    }
  }, [currentEmployee, isAdmin]);

  // DEBUG: Log available managers for troubleshooting
  useEffect(() => {
    if (isAdmin) {
      console.log('Available managers:', availableManagers);
    }
  }, [availableManagers, isAdmin]);

  useEffect(() => {
    // Hide manager field for CEO, else show
    if (formData.role === 'CEO') {
      setManagerFieldVisible(false);
      setFormData(prev => ({ ...prev, managerId: undefined }));
    } else {
      setManagerFieldVisible(true);
      // For non-admins, set managerId to current user's employeeId
      if (!isAdmin && currentEmployeeId) {
        setFormData(prev => ({ ...prev, managerId: String(currentEmployeeId) }));
      }
    }
  }, [formData.role, isAdmin, currentEmployeeId]);

  useEffect(() => {
    // For admins: auto-select first manager if not CEO and not set
    if (
      isAdmin &&
      managerFieldVisible &&
      formData.role !== 'CEO' &&
      availableManagers.length > 0 &&
      !formData.managerId
    ) {
      setFormData(prev => ({ ...prev, managerId: String(availableManagers[0].id) }));
    }
    // For CEO, clear managerId
    if (isAdmin && formData.role === 'CEO' && formData.managerId) {
      setFormData(prev => ({ ...prev, managerId: '' }));
    }
  }, [isAdmin, managerFieldVisible, formData.role, availableManagers, formData.managerId]);

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

    // Remove employeeNumber validation (now read-only)
    if (!formData.name.trim()) {
      newErrors.name = 'First name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Last name is required';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Valid salary is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    // For admins, require manager if not CEO
    if (isAdmin && formData.role !== 'CEO' && !formData.managerId) {
      newErrors.managerId = 'Manager is required for this role';
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
      const employeeData: CreateEmployeeRequest = {
        ...formData,
        salary: parseFloat(formData.salary),
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        department: formData.department || undefined,
        managerId: formData.managerId ? Number(formData.managerId) : undefined,
      };

      const response = await employeeService.createEmployee(employeeData);
      
      // Set employeeNumber in formData if returned
      if (response.employeeNumber) {
        setFormData(prev => ({ ...prev, employeeNumber: response.employeeNumber }));
      }

      showToast(
        `Employee "${response.name} ${response.surname}" created successfully!`,
        'success'
      );

      // If user credentials were generated, show them
      if (response.userCredentials) {
        setGeneratedCredentials({
          ...response.userCredentials,
          name: response.name,
          surname: response.surname,
        });
        setShowCredentials(true);
      } else {
        // If no credentials generated (no email), redirect immediately
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Create employee failed:', error);
      showToast(
        error.response?.data?.error || 'Failed to create employee. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  if (showCredentials && generatedCredentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#3A6F6F] mb-2">
                Employee Created Successfully!
              </h1>
              <p className="text-[#5F9EA0]">
                User account has been automatically created. Please share these credentials:
              </p>
            </div>

            <div className="bg-[#F0F9F9] border-2 border-[#B2D8D8] rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-[#3A6F6F] mb-4">Login Credentials</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5F9EA0]">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-1 rounded border text-[#3A6F6F]">
                      {generatedCredentials.email}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.email)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5F9EA0]">Temporary Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-1 rounded border text-[#3A6F6F] font-mono">
                      {generatedCredentials.temporaryPassword}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.temporaryPassword)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5F9EA0]">Access Level:</span>
                  <span className="text-sm font-semibold text-[#3A6F6F]">
                    {generatedCredentials.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> {generatedCredentials.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setShowCredentials(false);
                  setGeneratedCredentials(null);
                  setFormData({
                    employeeNumber: '',
                    name: '',
                    surname: '',
                    birthDate: '',
                    salary: '',
                    role: 'JUNIOR_EMPLOYEE',
                    email: '',
                    phoneNumber: '',
                    department: ''
                  });
                  setErrors({});
                }}
              >
                <UserPlus className="h-4 w-4" />
                Create Another Employee
              </Button>
              
              <Button
                fullWidth
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <Button
              variant="primary"
              className="w-full mt-2"
              onClick={() => generateEmployeeCredentialsPDF({
                name: generatedCredentials.name || '',
                email: generatedCredentials.email,
                password: generatedCredentials.temporaryPassword,
                role: generatedCredentials.role,
              })}
            >
              Download Credentials PDF
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#5F9EA0] to-[#6FB7B7] rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#3A6F6F] mb-2">
              Add New Employee
            </h1>
            <p className="text-[#5F9EA0] mb-4">
              Create a new employee record in the system
            </p>
            <div className="space-y-2">
              <div className="bg-[#FFF8DC] border border-[#DDD6AA] rounded-lg p-3 text-sm text-[#8B7355]">
                <strong>Role Hierarchy:</strong> You can only create employees at or below your organizational level.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Employee Number"
                name="employeeNumber"
                type="text"
                value={formData.employeeNumber}
                onChange={() => {}}
                error={errors.employeeNumber}
                disabled
                placeholder="Auto-generated"
                required
              />

              <div>
                <label className="block text-sm font-medium text-[#3A6F6F] mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingRoles}
                  className="block w-full px-4 py-3 border-2 border-[#B2D8D8] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] bg-white text-[#3A6F6F] transition-all duration-200"
                >
                  {isLoadingRoles ? (
                    <option value="">Loading available roles...</option>
                  ) : (
                    availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.replace(/_/g, ' ')}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-[#5F9EA0] mt-1">
                  {isLoadingRoles ? (
                    'Loading available roles for your access level...'
                  ) : (
                    <>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Last Name"
                name="surname"
                type="text"
                value={formData.surname}
                onChange={handleChange}
                error={errors.surname}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                error={errors.birthDate}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                error={errors.salary}
                disabled={isSubmitting}
                placeholder="50000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={isSubmitting}
                placeholder="employee@company.com"
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="0743501557"
              />
            </div>

            <Input
              label="Department "
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Engineering, HR, Sales, etc."
            />

            {/* Manager field logic */}
            {managerFieldVisible && (
              isAdmin ? (
                <div>
                  <label className="block text-sm font-medium text-[#3A6F6F] mb-1">Manager</label>
                  <select
                    name="managerId"
                    value={formData.managerId || ''}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-[#B2D8D8] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] bg-white text-[#3A6F6F] transition-all duration-200"
                    disabled={isSubmitting || (formData.role === 'CEO')}
                  >
                    {formData.role === 'CEO' ? (
                      <option value="">No Manager</option>
                    ) : (
                      availableManagers.length > 0 ? (
                        availableManagers.map((mgr) => (
                          <option key={mgr.id} value={mgr.id}>
                            {mgr.name} {mgr.surname} ({mgr.role})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No managers available</option>
                      )
                    )}
                  </select>
                  {errors.managerId && (
                    <p className="text-sm text-red-600 mt-1">{errors.managerId}</p>
                  )}
                </div>
              ) : (
                <>
                  <Input
                    label="Manager"
                    name="managerId"
                    type="text"
                    value={currentEmployee ? `${currentEmployee.name} ${currentEmployee.surname}` : 'Loading...'}
                    disabled
                    readOnly
                  />
                  {!currentEmployee && (
                    <p className="text-sm text-red-600 mt-1">No manager record found for your user. Please contact an admin.</p>
                  )}
                </>
              )
            )}

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
                {isSubmitting ? 'Creating Employee...' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
