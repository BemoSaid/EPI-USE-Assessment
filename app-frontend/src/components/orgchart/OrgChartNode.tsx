import React, { useCallback } from "react";
import { Building2, Users, User } from "lucide-react";

interface OrgChartNodeProps {
  nodeDatum: {
    name: string;
    attributes?: {
      role?: string;
      department?: string;
      email?: string;
    };
  };
  toggleNode?: () => void;
}

const getRoleColor = (role: string = ""): string => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes("ceo") || roleLower.includes("chief")) return "hsl(var(--org-node-ceo))";
  if (roleLower.includes("director") || roleLower.includes("vp")) return "hsl(var(--org-node-exec))";
  if (roleLower.includes("manager") || roleLower.includes("lead")) return "hsl(var(--org-node-manager))";
  return "hsl(var(--org-node-employee))";
};

const getRoleIcon = (role: string = "") => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes("ceo") || roleLower.includes("chief")) return Building2;
  if (roleLower.includes("director") || roleLower.includes("vp") || roleLower.includes("manager")) return Users;
  return User;
};

const getCardColors = (role: string = "") => {
  const roleLower = role.toLowerCase();
  if (
    roleLower.includes("ceo") ||
    roleLower.includes("chief") ||
    roleLower.includes("director") ||
    roleLower.includes("vp") ||
    roleLower.includes("manager") ||
    roleLower.includes("lead")
  ) {
    return { //primary
      fill: "#e0f2fe", 
      text: "#0369a1",
      border: "#bae6fd", 
    };
  }
  // secondary 
  return {
    fill: "#14b8a6", 
    text: "#fff", 
    border: "#0d9488",
  };
};

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({ nodeDatum, toggleNode }) => {
  const roleColor = getRoleColor(nodeDatum.attributes?.role);
  const RoleIcon = getRoleIcon(nodeDatum.attributes?.role);
  const cardColors = getCardColors(nodeDatum.attributes?.role);

  const handleClick = useCallback(() => {
    if (toggleNode) toggleNode();
  }, [toggleNode]);

  return (
    <g onClick={handleClick} className="cursor-pointer">
      <rect
        x={-120}
        y={-60}
        width={240}
        height={120}
        rx={18}
        fill="#fff"
        stroke="#14b8a6"
        strokeWidth={2}
        className="transition-all duration-300 hover:stroke-[3]"
        filter="url(#shadow)"
      />
      {/* Icon circle */}
      <circle cx={0} cy={-38} r={24} fill={roleColor} opacity={0.2} />
      <foreignObject x={-8} y={-46} width={16} height={16}>
        <RoleIcon size={16} color={roleColor} />
      </foreignObject>
      {/* Name text */}
      <text
        x={0}
        y={-4}
        fill={cardColors.text}
        className="text-base"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {nodeDatum.name}
      </text>
      {/* Role text */}
      <text
        x={0}
        y={28}
        fill={cardColors.text}
        className="text-sm"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {nodeDatum.attributes?.role || "Employee"}
      </text>
      {/* Department badge if available */}
      {nodeDatum.attributes?.department && (
        <rect
          x={-45}
          y={40}
          width={90}
          height={20}
          rx={10}
          fill={roleColor}
          opacity={0.15}
        />
      )}
      {nodeDatum.attributes?.department && (
        <text
          x={0}
          y={54}
          fill={roleColor}
          className="text-xs"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {nodeDatum.attributes.department}
        </text>
      )}
      {/* Shadow filter definition */}
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};
