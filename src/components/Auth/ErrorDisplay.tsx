import React from "react";
import { ShieldAlert } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  if (!message) return null;

  return (
    <div
      id="auth-error-display"
      className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs leading-relaxed"
    >
      <ShieldAlert className="w-4.5 h-4.5 text-red-450 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
