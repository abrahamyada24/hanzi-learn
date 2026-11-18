import React, { useEffect } from 'react';
import { focusRing } from './tokens';

interface DialogProps {
  eyebrow: string;
  onClose: () => void;
  size?: 'sm' | 'lg';
  closeLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared modal shell: flat paper panel, ink border, Esc to close, no blur or shadow. */
export const Dialog: React.FC<DialogProps> = ({ eyebrow, onClose, size = 'sm', closeLabel = 'Tutup', children, footer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151210]/70 animate-in fade-in"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={eyebrow}
        className={`w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-sm'} bg-paper text-ink border border-ink flex flex-col max-h-[92vh]`}
      >
        <div className="flex items-baseline justify-between border-b-2 border-ink px-5 pt-4 pb-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</span>
          <button
            onClick={onClose}
            className={`text-xs font-semibold text-ink underline underline-offset-4 decoration-1 hover:text-vermilion ${focusRing}`}
          >
            {closeLabel}
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
        {footer && <div className="border-t border-ink">{footer}</div>}
      </div>
    </div>
  );
};
