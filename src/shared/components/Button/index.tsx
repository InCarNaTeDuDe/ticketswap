import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children?: React.ReactNode;
  className?: string;
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseClass = 'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5';
  const variantClass = {
    primary: 'bg-pink-600 hover:bg-pink-500 text-white shadow shadow-pink-900/25',
    secondary: 'bg-gray-900 hover:bg-gray-850 text-gray-300 hover:text-white border border-gray-800',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  }[variant];

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
