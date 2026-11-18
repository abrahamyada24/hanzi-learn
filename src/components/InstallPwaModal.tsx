import React from 'react';
import { Dialog } from './ui/Dialog';
import { focusRing } from './ui/marks';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIos: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose, onInstall, isIos }) => {
  if (!isOpen) return null;

  return (
    <Dialog eyebrow="Pasang aplikasi" onClose={onClose}>
      <div className="px-5 py-6">
        <div className="font-serif font-black text-7xl leading-none text-vermilion">汉</div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">Pasang HanziLearn</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Gunakan seperti aplikasi bawaan HP: akses instan, layar penuh, dan hemat kuota.
        </p>

        {isIos ? (
          <div className="mt-5 border-t border-ink pt-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Cara pasang di iPhone (Safari)</div>
            <ol className="mt-2 space-y-2 text-sm text-ink list-decimal list-inside marker:text-vermilion marker:font-semibold">
              <li>Tekan tombol <strong>Share</strong> (kotak berpanah ke atas di bawah Safari).</li>
              <li>Gulir dan pilih <strong>&quot;Add to Home Screen&quot;</strong> (Tambahkan ke Layar Utama).</li>
              <li>Tekan <strong>Add</strong> di pojok kanan atas. Selesai.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              onClick={onInstall}
              className={`w-full bg-ink text-paper py-3.5 px-5 text-sm font-semibold flex justify-between hover:bg-vermilion transition-colors ${focusRing}`}
            >
              <span>Pasang sekarang</span>
              <span aria-hidden>&rarr;</span>
            </button>
            <button
              onClick={onClose}
              className={`w-full text-xs text-muted underline underline-offset-4 decoration-1 hover:text-ink ${focusRing}`}
            >
              Nanti saja
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
