import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
  const bgClass = {
    primary: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    secondary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }[variant];

  return (
    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono uppercase tracking-wide ${bgClass}`}>
      {children}
    </span>
  );
}
