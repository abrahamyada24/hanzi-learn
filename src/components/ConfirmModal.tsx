import React from 'react';
import { Dialog } from './ui/Dialog';
import { focusRing } from './ui/marks';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <Dialog eyebrow={isDestructive ? 'Tindakan permanen' : 'Konfirmasi'} onClose={onCancel}>
      <div className="px-5 py-6">
        <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`border border-ink py-3 text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors ${focusRing}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-3 text-sm font-semibold text-paper transition-colors ${focusRing} ${
              isDestructive ? 'bg-vermilion hover:bg-ink' : 'bg-ink hover:bg-vermilion'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
