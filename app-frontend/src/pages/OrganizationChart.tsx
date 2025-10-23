import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { employeeService } from "../services/employeeService";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { LucideAlignVerticalJustifyCenter } from "lucide-react";

interface OrgNode {
  id: number;
  name: string;
  surname: string;
  role: string;
  children?: OrgNode[];
}

function transformNode(node: OrgNode): any {
  return {
    name: `${node.name} ${node.surname}`,
    attributes: { role: node.role },
    children: node.children ? node.children.map(transformNode) : [],
  };
}

export const OrganizationChart: React.FC = () => {
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    employeeService
      .getHierarchy()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTreeData(transformNode(data[0]));
        } else {
          setError("No hierarchy data found.");
        }
      })
      .catch(() => setError("Failed to load organization chart."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-slate-400 py-10">Loading chart...</div>;
  if (error) return <div className="text-center text-red-400 py-10">{error}</div>;
  if (!treeData) return null;

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-4 gap-4">
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          <h1 className="text-2xl font-bold text-[#3A6F6F]">Organization Chart</h1>
        </div>
        <div className="w-full h-[80vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-lg">
          <Tree
            data={treeData}
            orientation="vertical"
            translate={{ x: 500, y: 50 }}
            zoom={0.8}
            pathFunc="diagonal"
            renderCustomNodeElement={({ nodeDatum }) => (
              <g>
                <circle r={20} fill="#14b8a6" stroke="#0d9488" strokeWidth={2} />
                <text fill="white" x={30} dy={-5} className="font-semibold">{nodeDatum.name}</text>
                <text fill="#cbd5e1" x={30} dy={15} className="text-xs">
                  {nodeDatum.attributes?.role}
                </text>
              </g>
            )}
          />
        </div>
      </div>
    </div>
  );
};
