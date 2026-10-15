import React from 'react';
import { Download, X, Share } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIos: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIos
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 text-center relative animate-in zoom-in-95 duration-150 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-serif font-bold text-3xl flex items-center justify-center mx-auto shadow-md mb-3">
          汉
        </div>

        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Pasang Aplikasi HanziLearn
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
          Gunakan HanziLearn seperti aplikasi bawaan HP: akses instan, satu layar penuh (*fullscreen*), dan hemat kuota!
        </p>

        {isIos ? (
          <div className="mt-4 p-3.5 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2">
            <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Share className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cara Pasang di iPhone (Safari):</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-stone-600 dark:text-stone-400 text-[11px]">
              <li>Tekan tombol <strong>Share</strong> (kotak panah ke atas di bagian bawah Safari).</li>
              <li>Gulir ke bawah dan pilih <strong>&quot;Add to Home Screen&quot;</strong> (Tambahkan ke Layar Utama).</li>
              <li>Tekan <strong>Add</strong> di pojok kanan atas. Selesai!</li>
            </ol>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            <button
              onClick={onInstall}
              className="w-full py-3 bg-red-700 text-white font-semibold text-sm rounded-2xl hover:bg-red-800 shadow-md transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Sekarang (1-Klik)</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 font-medium"
            >
              Nanti Saja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
