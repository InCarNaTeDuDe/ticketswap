import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'error' | 'success' | 'warning';
}

export default function Alert({ children, variant = 'info' }: AlertProps) {
  const bgClass = {
    info: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    error: 'bg-rose-500/15 border-rose-500/20 text-rose-400',
    success: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  }[variant];

  return (
    <div className={`p-4 rounded-xl text-xs font-semibold border ${bgClass}`}>
      {children}
    </div>
  );
}
