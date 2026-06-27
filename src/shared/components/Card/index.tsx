import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export default function Card({ children, className = '', isHoverable = false }: CardProps) {
  const hoverClass = isHoverable ? 'glass-card-hover' : '';
  return (
    <div className={`glass-card rounded-2xl p-5 overflow-hidden border border-gray-850 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
