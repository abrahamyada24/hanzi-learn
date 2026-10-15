import React, { useState } from 'react';
import { 
  Cloud, 
  LogOut, 
  Download, 
  Flame, 
  CheckCircle, 
  PenTool, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Smartphone,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../context/ThemeContext';
import type { UserStats } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ProfileViewProps {
  stats: UserStats;
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  isStandalone: boolean;
  onInstallApp: () => void;
  onResetProgress: () => void;
  onManualSync: () => void;
  isSyncing?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  totalWords,
  masteredCount,
  learningCount,
  isStandalone,
  onInstallApp,
  onResetProgress,
  onManualSync,
  isSyncing = false
}) => {
  const { user, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const percentMastered = Math.round((masteredCount / totalWords) * 100) || 0;

  const themeOptions: { id: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Terang', icon: Sun },
    { id: 'system', label: 'Sistem', icon: Monitor },
    { id: 'dark', label: 'Gelap', icon: Moon }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in">
      {/* 1. USER IDENTITY CARD */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden transition-colors">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-red-100 dark:border-red-950 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-red-700 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-xs">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {user.displayName || 'Pengguna HanziLearn'}
                  </h2>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200/80 dark:border-emerald-800/60">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Akun Google Terhubung</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="self-start sm:self-center py-2 px-3.5 bg-stone-50 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center mx-auto">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Hubungkan Akun Google
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
                Sinkronkan progres hafalan kata, jumlah goresan, dan hari belajar secara otomatis di semua perangkatmu (HP & Laptop).
              </p>
            </div>
            <button
              onClick={() => loginWithGoogle()}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 rounded-2xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. PENGATURAN TEMA & TAMPILAN (DARK MODE) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Tema & Mode Tampilan
              </h3>
              <p className="text-[11px] text-stone-400">
                Sesuaikan kenyamanan mata saat membaca dan menulis aksara
              </p>
            </div>
          </div>
        </div>

        {/* 3-Segment Theme Switcher */}
        <div className="grid grid-cols-3 gap-2 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-2xl">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? (opt.id === 'dark' ? 'text-amber-400' : 'text-red-600') : ''}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STATISTIK BELAJAR RINCI */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Statistik Belajar HSK 1</h3>
          </div>
          <span className="text-xs text-stone-400 font-semibold">{percentMastered}% Selesai</span>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-3.5 border border-stone-100 dark:border-stone-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Streak</div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">{stats.streakDays} Hari</div>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-3.5 border border-stone-100 dark:border-stone-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Ditulis</div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">{stats.charactersWritten} Karakter</div>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-3.5 border border-stone-100 dark:border-stone-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Dikuasai</div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">{masteredCount} Kata</div>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-3.5 border border-stone-100 dark:border-stone-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Diproses</div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">{learningCount} Kata</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Kemajuan HSK 1</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{masteredCount} dari {totalWords} kata</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(masteredCount / totalWords) * 100}%` }}
            />
            <div 
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(learningCount / totalWords) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. PWA APP INSTALLATION */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-xs flex-shrink-0">
              汉
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Aplikasi HanziLearn (PWA)</span>
                {isStandalone && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Terpasang
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                {isStandalone 
                  ? 'Aplikasi sedang berjalan dalam mode layar penuh (standalone).' 
                  : 'Pasang ke layar utama HP atau desktop agar bisa diakses cepat layaknya aplikasi native.'}
              </p>
            </div>
          </div>

          {!isStandalone ? (
            <button
              onClick={onInstallApp}
              className="py-2.5 px-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white border border-stone-800 dark:border-stone-700 rounded-2xl text-xs font-semibold transition flex items-center justify-center gap-2 active:scale-95 shadow-xs whitespace-nowrap self-start sm:self-center"
            >
              <Download className="w-4 h-4 text-red-400 dark:text-red-400" />
              <span>Install di HP</span>
            </button>
          ) : (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Aktif di Perangkat</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. UTILITY & DANGER ZONE */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-400">
          Sinkronisasi & Pengaturan Data
        </h3>

        <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
          {/* Manual Sync */}
          {user && (
            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-200">Sinkronisasi Cloud Sekarang</div>
                <div className="text-stone-400 text-[11px]">Unggah dan gabungkan progres lokal terbaru ke server</div>
              </div>
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold transition active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}
              </button>
            </div>
          )}

          {/* Reset Local Data */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-stone-800 dark:text-stone-200">Reset Progres Belajar Lokal</div>
              <div className="text-stone-400 text-[11px]">Mengosongkan cache hafalan dan streak pada perangkat ini</div>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-1.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl font-semibold transition active:scale-95 whitespace-nowrap flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER APP VERSION */}
      <div className="text-center text-xs text-stone-400 pt-2 pb-6 space-y-1">
        <p className="font-semibold text-stone-500 dark:text-stone-400">HanziLearn &middot; Aksara Mandarin Mandiri</p>
        <p className="text-[11px]">Dibuat untuk pembelajaran HSK 1 dan Piktogram Aksara</p>
      </div>

      {/* CONFIRMATION MODALS */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Keluar dari Akun?"
        message="Progres belajarmu telah tersimpan aman di Google Cloud. Kamu dapat masuk kembali kapan saja untuk melanjutkan."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        isDestructive={false}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Progres Belajar?"
        message="Perhatian: Tindakan ini akan mengosongkan statistik belajar, hafalan kata, dan streak pada perangkat ini. Apakah kamu yakin?"
        confirmLabel="Hapus Progres"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={() => {
          onResetProgress();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
