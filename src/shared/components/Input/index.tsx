import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 font-mono uppercase">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs focus:border-pink-500 focus:outline-none placeholder-gray-550 text-white ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-rose-500 font-medium font-mono">{error}</p>}
    </div>
  );
}
