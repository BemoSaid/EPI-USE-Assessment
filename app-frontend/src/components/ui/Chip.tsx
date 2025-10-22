import React from "react";

interface ChipProps {
  label: string;
  color?: string;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, color = "#5F9EA0", className }) => (
  <span
    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mr-2 mb-2 bg-opacity-10 border border-[#B2D8D8] text-[${color}] ${className || ''}`}
    style={{ backgroundColor: color + '22', color }}
  >
    {label}
  </span>
);
