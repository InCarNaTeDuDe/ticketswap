import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={`${sizeClass} rounded-full border border-gray-800 overflow-hidden shrink-0`}>
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt={name || "Avatar"} />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold text-gray-300">
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
}
