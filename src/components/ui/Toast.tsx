"use client";

import { Toast } from "@/hooks/useToast";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const icons = {
  success: <CheckCircle size={16} className="text-green-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-yellow-400" />,
};

const colors = {
  success: "border-green-500/30 bg-green-500/10",
  error: "border-red-500/30 bg-red-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
  warning: "border-yellow-500/30 bg-yellow-500/10",
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
            shadow-lg pointer-events-auto animate-slide-up min-w-[280px] max-w-[380px]
            ${colors[toast.type]}`}
          style={{ background: "rgba(22, 25, 34, 0.95)" }}
        >
          {icons[toast.type]}
          <span className="flex-1 text-sm text-kanban-text font-body">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-kanban-muted hover:text-kanban-text transition-smooth ml-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
