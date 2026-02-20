import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
}

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div className={`card card-padding-${padding} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
