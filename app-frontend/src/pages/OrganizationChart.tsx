import React, { useEffect, useState, useRef } from "react";
import { OrgChart2D } from "../components/orgchart/OrgChart2D";
import { ViewControls } from "../components/orgchart/ViewControls";
import { SearchBar } from "../components/orgchart/SearchBar";
import { employeeService } from "../services/employeeService";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import ShinyText from '../components/ui/ShinyText';

function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children && node.children.length > 0) {
    count += node.children.map(countNodes).reduce((a: number, b: number) => a + b, 0);
  }
  return count;
}

function transformNode(node: any): any {
  return {
    name: `${node.name} ${node.surname}`,
    attributes: { role: node.role, department: node.department, email: node.email },
    children: node.children ? node.children.map(transformNode) : [],
  };
}

function filterTree(node: any, query: string): any | null {
  if (!query) return node;
  const q = query.toLowerCase();
  const match = node.name.toLowerCase().includes(q) ||
    (node.attributes?.role && node.attributes.role.toLowerCase().includes(q)) ||
    (node.attributes?.department && node.attributes.department.toLowerCase().includes(q));
  const filteredChildren = node.children
    ? node.children.map((child: any) => filterTree(child, query)).filter(Boolean)
    : [];
  if (match || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }
  return null;
}

export const OrganizationChart: React.FC = () => {
  const [treeData, setTreeData] = useState<any>(null);
  const [filteredTree, setFilteredTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [search, setSearch] = useState("");
  const chartRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    employeeService
      .getHierarchy()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const tree = transformNode(data[0]);
          setTreeData(tree);
          setFilteredTree(tree);
        } else {
          setError("No hierarchy data found.");
        }
      })
      .catch(() => setError("Failed to load organization chart."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!treeData) return;
    if (!search) {
      setFilteredTree(treeData);
    } else {
      const filtered = filterTree(treeData, search);
      setFilteredTree(filtered);
    }
  }, [search, treeData]);

  const handleReset = () => {
    setOrientation("vertical");
    setSearch("");
    chartRef.current?.reset?.();
  };

  if (loading) return <div className="text-center text-slate-400 py-10">Loading chart...</div>;
  if (error) return <div className="text-center text-red-400 py-10">{error}</div>;
  if (!filteredTree) return <div className="text-center text-slate-400 py-10">No results found.</div>;

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{`
        .rd3t-svg text {
           font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-4 gap-4">
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          <ShinyText text="Organization Chart" speed={3} className="text-2xl font-bold" />
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="flex w-full items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-elevation-medium">
            <div className="flex-1 min-w-0">
              <SearchBar onSearch={setSearch} />
            </div>
            <div className="shrink-0">
              <ViewControls
                orientation={orientation}
                onOrientationChange={setOrientation}
                onReset={handleReset}
                totalNodes={countNodes(filteredTree)}
              />
            </div>
          </div>
        </div>
        <div className="w-full h-[80vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-lg mt-4">
          <OrgChart2D
            data={filteredTree}
            orientation={orientation}
            onNodeClick={(node) => {
              // Optionally show a modal or details here
            }}
          />
        </div>
      </div>
    </div>
  );
};
