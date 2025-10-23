import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "secondary" | "primary";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "primary", className = "", ...props }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        variant === "secondary"
          ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]"
          : "bg-[#14b8a6] text-white border border-[#0d9488]"
      } ${className}`}
      {...props}
    />
  );
};
