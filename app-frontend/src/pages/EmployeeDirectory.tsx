import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { THEME_CLASSES } from "../utils/theme";
import { employeeService, Employee, EmployeeFilters } from "../services/employeeService";
import { Download, Upload, Edit, Trash2, ArrowUpDown, UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/ui/Modal";
import { EmployeeCard } from "../components/EmployeeCard";
import { EmployeeProfile } from "../components/EmployeeProfile";
import { Chip } from "../components/ui/Chip";
import { TagFilter } from "../components/TagFilter";

export const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmPromoteId, setConfirmPromoteId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [search, sortKey, sortAsc, selectedTags, departmentFilter, roleFilter]);

  useEffect(() => {
    setTagFilters([]);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const filters: EmployeeFilters = {
        search,
        sortField: sortKey,
        sortDirection: sortAsc ? "asc" : "desc",
        page: 1,
        limit: 50,
        department: departmentFilter || undefined,
        role: roleFilter || undefined,
      };
      const { employees, total } = await employeeService.getAllEmployees(filters);
      setEmployees(employees);
      setTotal(total);
    } catch (error) {
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc((asc) => !asc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handlePromote = (id: number) => {
    setConfirmPromoteId(id);
  };

  const confirmPromote = async () => {
    if (confirmPromoteId !== null) {
      try {
        await employeeService.promoteEmployee(confirmPromoteId);
        setFeedback({ message: 'Employee promoted!', type: 'success' });
        setConfirmPromoteId(null);
        fetchEmployees();
      } catch (error: any) {
        let errorMsg = 'Failed to promote employee. Permission is not granted based on your access rights.';
        setFeedback({ message: errorMsg, type: 'error' });
      }
    }
  };

  const handleEdit = (id: number) => {
    const emp = employees.find(e => e.id === id);
    if (emp) setEditEmployee(emp);
  };

  const handleEditSubmit = async (updated: Partial<Employee>) => {
    if (!editEmployee) return;
    try {
      await employeeService.updateEmployee(editEmployee.id, updated);
      setFeedback({ message: 'Employee updated!', type: 'success' });
      setEditEmployee(null);
      fetchEmployees();
    } catch (error) {
      setFeedback({ message: 'Failed to update employee', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId !== null) {
      try {
        await employeeService.deleteEmployee(confirmDeleteId);
        setFeedback({ message: 'Employee deleted!', type: 'success' });
        setConfirmDeleteId(null);
        fetchEmployees();
      } catch (error: any) {
        let errorMsg = 'Failed to delete employee. Permission is not granted based on your access rights.';
        setFeedback({ message: errorMsg, type: 'error' });
      }
    }
  };

  const handleExport = () => alert("Export CSV");
  const handleImport = () => alert("Import CSV");

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Group employees by department
  const employeesByDept: Record<string, Employee[]> = {};
  employees.forEach((e) => {
    const dept = e.department || "Other";
    if (!employeesByDept[dept]) employeesByDept[dept] = [];
    employeesByDept[dept].push(e);
  });

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-4 gap-4">
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-[#3A6F6F]">Employee Directory</h1>
        </div>
        {/* Filters & Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button className={THEME_CLASSES.outlineButton} onClick={handleExport} title="Export CSV">
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button className={THEME_CLASSES.outlineButton} onClick={handleImport} title="Import CSV">
                  <Upload className="w-4 h-4 mr-1" /> Import
                </Button>
              </div>
              <TagFilter tags={tagFilters} selected={selectedTags} onToggle={handleTagToggle} />
            </div>
            <div className="flex gap-2">
              <Input
                className="w-full md:w-72 rounded-lg border border-[#B2D8D8] bg-[#F0F9F9] text-[#3A6F6F] placeholder-[#B2D8D8] focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] transition"
                placeholder="Search by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {/* Department filter */}
              <select
                className="rounded-lg border border-[#B2D8D8] px-3 py-2 text-[#3A6F6F] bg-[#F0F9F9] focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] transition"
                value={departmentFilter || ""}
                onChange={e => setDepartmentFilter(e.target.value || null)}
              >
                <option value="">All Departments</option>
                {Object.keys(employeesByDept).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {/* Role filter */}
              <select
                className="rounded-lg border border-[#B2D8D8] px-3 py-2 text-[#3A6F6F] bg-[#F0F9F9] focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] transition"
                value={roleFilter || ""}
                onChange={e => setRoleFilter(e.target.value || null)}
              >
                <option value="">All Roles</option>
                {[...new Set(employees.map(e => e.role))].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Sectioned by department */}
          {loading ? (
            <div className="text-center py-8 text-[#B2D8D8]">Loading...</div>
          ) : total === 0 ? (
            <div className="text-center py-8 text-[#B2D8D8]">No employees found.</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(employeesByDept).map(([dept, emps]) => (
                <Card key={dept} className="bg-white/10 border border-[#B2D8D8] shadow p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip label={dept} color="#6FB7B7" />
                    <span className="text-xs text-[#5F9EA0]">{emps.length} employee{emps.length === 1 ? '' : 's'}</span>
                  </div>
                  <table className="min-w-full bg-transparent text-[#3A6F6F]">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emps.map(e => (
                        <tr key={e.id} className="border-t border-[#B2D8D8] hover:bg-[#E8F4F8] transition">
                          <td className="px-4 py-2 font-medium">
                            <button className="hover:underline text-[#5F9EA0]" onClick={() => setSelectedEmployee(e)}>
                              {e.name} {e.surname}
                            </button>
                          </td>
                          <td className="px-4 py-2">{e.email}</td>
                          <td className="px-4 py-2">{e.role}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(e.id)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)} title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handlePromote(e.id)} title="Promote">
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ))}
            </div>
          )}
        </Card>
        <Modal open={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Profile">
          {selectedEmployee && <EmployeeProfile employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
        </Modal>
        {/* Delete confirmation modal */}
        <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Confirm Delete">
          <div className="py-4 text-[#3A6F6F]">
            <p className="mb-4">Are you sure you want to permanently remove this employee from the system? You will not be able to retrieve this employee once deleted.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="primary" className={THEME_CLASSES.primaryButton} onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
        {/* Promote confirmation modal */}
        <Modal open={confirmPromoteId !== null} onClose={() => setConfirmPromoteId(null)} title="Confirm Promotion">
          <div className="py-4 text-[#3A6F6F]">
            <p className="mb-4">Are you sure you want to promote this employee?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmPromoteId(null)}>Cancel</Button>
              <Button variant="primary" className={THEME_CLASSES.primaryButton} onClick={confirmPromote}>Promote</Button>
            </div>
          </div>
        </Modal>
        {/* Feedback modal */}
        <Modal open={!!feedback} onClose={() => setFeedback(null)} title={feedback?.type === 'success' ? 'Success' : 'Error'}>
          <div className={`py-4 text-center ${feedback?.type === 'success' ? 'text-green-600' : 'text-[#B2D8D8] bg-[#F0F9F9]'}`}>
            <p>{feedback?.message}</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setFeedback(null)}>OK</Button>
            </div>
          </div>
        </Modal>
        {/* Edit Employee modal */}
        <Modal open={!!editEmployee} onClose={() => setEditEmployee(null)} title="Edit Employee">
          {editEmployee && (
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updated: Partial<Employee> = {
                  name: formData.get('name') as string,
                  surname: formData.get('surname') as string,
                  role: formData.get('role') as string,
                  department: formData.get('department') as string,
                  phoneNumber: formData.get('phoneNumber') as string,
                };
                handleEditSubmit(updated);
              }}
            >
              <Input name="name" defaultValue={editEmployee.name} label="Name" required />
              <Input name="surname" defaultValue={editEmployee.surname} label="Surname" required />
              <Input name="phoneNumber" defaultValue={editEmployee.phoneNumber || ''} label="Phone Number" />
              <Input name="department" defaultValue={editEmployee.department || ''} label="Department" />

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditEmployee(null)} type="button">Cancel</Button>
                <Button variant="primary" className={THEME_CLASSES.primaryButton} type="submit">Save</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};
