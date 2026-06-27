import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
}

export default function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 font-mono uppercase">{label}</label>}
      <textarea
        className={`w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs focus:border-pink-500 focus:outline-none placeholder-gray-550 text-white ${className}`}
        {...props}
      />
    </div>
  );
}
