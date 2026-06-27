import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export default function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 font-mono uppercase">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs focus:border-pink-500 focus:outline-none text-white ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
