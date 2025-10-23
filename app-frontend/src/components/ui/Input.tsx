// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[#3A6F6F]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block px-4 py-3 border-2 border-[#B2D8D8] rounded-lg shadow-sm placeholder-[#5F9EA0] bg-white text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] transition-all duration-200',
            'disabled:bg-[#F0F9F9] disabled:text-[#B2D8D8] disabled:cursor-not-allowed',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-[#5F9EA0]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';