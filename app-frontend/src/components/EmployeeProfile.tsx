import React from "react";
import { Employee } from "../services/employeeService";
import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";
import { Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

interface EmployeeProfileProps {
  employee: Employee;
  onClose: () => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, onClose }) => {
  const getInitials = () => {
    return `${employee.name?.[0] || ''}${employee.surname?.[0] || ''}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fallbacks for missing fields
  const bio = (employee as any).bio || '';
  const location = (employee as any).location || '-';
  const startDate = (employee as any).startDate || employee.birthDate;
  const reports = (employee as any).reports;
  const skills = (employee as any).skills || [];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Profile content (header removed) */}
      <div className="px-8 pb-8">
        {/* Avatar and info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#5F9EA0] to-[#6FB7B7] flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
            {getInitials()}
          </div>
          <div className="flex-1 pb-2">
            <h2 className="text-3xl font-bold text-[#3A6F6F] mb-1">
              {employee.name} {employee.surname}
            </h2>
            <p className="text-lg text-[#5F9EA0]">{employee.role}</p>
          </div>
        </div>

        {/* Department badge */}
        <div className="mb-6">
          <Chip label={employee.department || '-'} color="#6FB7B7" />
        </div>

        {/* Bio */}
        {bio && (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#3A6F6F] mb-2 uppercase tracking-wide">About</h3>
              <p className="text-[#5F9EA0] leading-relaxed">{bio}</p>
            </div>
            <hr className="my-6 border-[#B2D8D8]" />
          </>
        )}

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#3A6F6F] mb-4 uppercase tracking-wide">Contact Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F9F9] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#6FB7B7]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#B2D8D8] mb-1">Email</p>
                <p className="text-sm text-[#3A6F6F] break-all">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F9F9] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#6FB7B7]" />
              </div>
              <div>
                <p className="text-xs text-[#B2D8D8] mb-1">Phone</p>
                <p className="text-sm text-[#3A6F6F]">{employee.phoneNumber || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F9F9] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#6FB7B7]" />
              </div>
              <div>
                <p className="text-xs text-[#B2D8D8] mb-1">Location</p>
                <p className="text-sm text-[#3A6F6F]">{location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F9F9] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#6FB7B7]" />
              </div>
              <div>
                <p className="text-xs text-[#B2D8D8] mb-1">Start Date</p>
                <p className="text-sm text-[#3A6F6F]">{formatDate(startDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team info */}
        {reports !== undefined && (
          <>
            <hr className="my-6 border-[#B2D8D8]" />
            <div className="flex items-center gap-3 text-[#5F9EA0]">
              <Users className="w-5 h-5" />
              <span className="text-sm">
                Manages {reports} {reports === 1 ? 'team member' : 'team members'}
              </span>
            </div>
          </>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <>
            <hr className="my-6 border-[#B2D8D8]" />
            <div>
              <h3 className="text-sm font-semibold text-[#3A6F6F] mb-3 uppercase tracking-wide">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <Chip key={index} label={skill} color="#B2D8D8" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <Button className="flex-1" variant="primary">
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
};
