import React from "react";

interface AnalyticsMiniDashboardProps {
  totalEmployees: number;
  avgSalaryByDept: Record<string, number>;
}

export const AnalyticsMiniDashboard: React.FC<AnalyticsMiniDashboardProps> = ({ totalEmployees, avgSalaryByDept }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-6 border border-[#B2D8D8]">
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-3xl font-bold text-[#3A6F6F]">{totalEmployees}</div>
      <div className="text-sm text-[#5F9EA0]">Total Employees</div>
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-[#3A6F6F] mb-2">Avg. Salary by Dept.</div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(avgSalaryByDept).map(([dept, avg]) => (
          <div key={dept} className="bg-[#F0F9F9] rounded px-3 py-1 text-xs text-[#3A6F6F] border border-[#B2D8D8]">
            {dept}: <span className="font-bold">${avg.toLocaleString()}</span>
          </div>
        ))}
      </div>    </div>
  </div>
);
