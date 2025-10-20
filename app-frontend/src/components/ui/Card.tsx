import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg" | "xl"; 
  title?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "md",
  title,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  return (
    <div
      className={clsx(
        "bg-[#F0F9F9] rounded-lg border border-[#B2D8D8]",
        shadowClasses[shadow],
        className
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-[#B2D8D8]">
          <h3 className="text-lg font-semibold text-[#3A6F6F]">{title}</h3>
        </div>
      )}
      <div className={clsx(paddingClasses[padding])}>{children}</div>
    </div>
  );
};
