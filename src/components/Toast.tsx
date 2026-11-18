import React, { useEffect } from 'react';

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

const TYPE_LABEL: Record<ToastType, string> = {
  success: 'Berhasil',
  error: 'Gagal',
  info: 'Info'
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92vw] animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="relative bg-ink text-paper pl-5 pr-4 py-3 flex items-center justify-between gap-4 text-sm">
        <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-1 ${toast.type === 'error' ? 'bg-vermilion' : 'bg-paper/40'}`} />
        <div className="min-w-0 flex items-baseline gap-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] flex-shrink-0 ${toast.type === 'error' ? 'text-vermilion' : 'text-paper/60'}`}>
            {TYPE_LABEL[toast.type]}
          </span>
          <span className="truncate">{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-paper/70 hover:text-paper underline underline-offset-4 flex-shrink-0"
          aria-label="Tutup notifikasi"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
