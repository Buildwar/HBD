import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors',
                icon && 'pl-10',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
