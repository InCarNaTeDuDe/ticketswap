import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

export default function Toast({ message, type = 'success' }: ToastProps) {
  const bgClass = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl text-white text-xs font-bold shadow ${bgClass}`}>
      {message}
    </div>
  );
}
