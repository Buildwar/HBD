import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-dark-surface border border-dark-border/70 rounded-2xl p-5 transition-all duration-200',
          hoverable && 'hover:border-dark-border hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
