import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 border border-dashed border-gray-800 rounded-2xl max-w-md mx-auto">
      {icon && <div className="text-zinc-650 mx-auto mb-4">{icon}</div>}
      <h4 className="font-bold text-white text-base">{title}</h4>
      <p className="text-xs text-gray-400 mt-1.5 leading-normal max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
