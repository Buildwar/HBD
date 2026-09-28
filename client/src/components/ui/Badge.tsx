import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'gray' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    brand: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
    gray: 'bg-dark-card text-gray-300 border-dark-border',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 rounded-full border tracking-wide',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
