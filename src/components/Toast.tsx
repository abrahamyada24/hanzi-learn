import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-stone-900/95 text-white border-stone-700/60',
    error: 'bg-red-950/95 text-white border-red-800/80',
    info: 'bg-stone-900/95 text-white border-stone-700/60'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92vw] animate-in fade-in slide-in-from-top-3 duration-200">
      <div className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 text-xs font-medium ${bgStyles[toast.type]}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[toast.type]}
          <span className="truncate">{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-white rounded-lg transition flex-shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
