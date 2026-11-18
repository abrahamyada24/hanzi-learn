import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../context/ThemeContext';
import { checkIsAdmin } from '../services/adminService';
import type { UserStats } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { focusRing } from './ui/tokens';

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
  onOpenFeedback: () => void;
  onOpenAdmin: () => void;
}

const Section: React.FC<{ index: string; title: string; aside?: string; children: React.ReactNode }> = ({ index, title, aside, children }) => (
  <section>
    <div className="flex items-baseline justify-between border-t-2 border-ink pt-3 text-[11px] font-medium uppercase tracking-[0.14em]">
      <span className="flex gap-3"><span className="text-vermilion">{index}</span><span className="text-ink">{title}</span></span>
      {aside && <span className="text-muted normal-case tracking-normal">{aside}</span>}
    </div>
    <div className="pt-4">{children}</div>
  </section>
);

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  totalWords,
  masteredCount,
  learningCount,
  isStandalone,
  onInstallApp,
  onResetProgress,
  onManualSync,
  isSyncing = false,
  onOpenFeedback,
  onOpenAdmin
}) => {
  const { user, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [versionClicks, setVersionClicks] = useState(0);

  const isAdmin = checkIsAdmin(user?.email);

  const percentMastered = Math.round((masteredCount / totalWords) * 100) || 0;

  const themeOptions: { id: Theme; label: string }[] = [
    { id: 'light', label: 'Terang' },
    { id: 'system', label: 'Sistem' },
    { id: 'dark', label: 'Gelap' }
  ];

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';
  const rowBtn = `border border-ink px-4 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-paper transition-colors whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none ${focusRing}`;

  const figures = [
    { label: 'Streak', value: stats.streakDays, unit: 'hari' },
    { label: 'Ditulis', value: stats.charactersWritten, unit: 'karakter' },
    { label: 'Dikuasai', value: masteredCount, unit: 'kata' },
    { label: 'Diproses', value: learningCount, unit: 'kata' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in pb-4">
      {/* 01 Akun */}
      <Section index="01" title="Akun" aside={user ? 'Terhubung ke Google' : 'Belum masuk'}>
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-16 h-16 object-cover border border-ink flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-ink text-paper font-serif font-black text-3xl flex items-center justify-center flex-shrink-0">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-ink truncate">{user.displayName || 'Pengguna HanziLearn'}</h2>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className={`${rowBtn} self-start sm:self-center`}>
              Keluar
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Hubungkan akun Google</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Sinkronkan progres hafalan kata, jumlah goresan, dan hari belajar secara otomatis di semua perangkatmu (HP dan laptop).
            </p>
            <button
              onClick={() => loginWithGoogle()}
              className={`mt-5 bg-ink text-paper px-6 py-3 text-sm font-semibold flex items-center gap-8 hover:bg-vermilion transition-colors ${focusRing}`}
            >
              <span>Masuk dengan Google</span>
              <span aria-hidden>&rarr;</span>
            </button>
          </div>
        )}
      </Section>

      {/* 02 Statistik */}
      <Section index="02" title="Statistik belajar HSK 1" aside={`${percentMastered}% selesai`}>
        <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-ink">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className={`py-4 pr-3 ${i % 2 === 1 ? 'pl-4 border-l border-ink/20' : ''} ${i > 0 ? 'sm:pl-4 sm:border-l sm:border-ink/20' : ''} ${i >= 2 ? 'border-t border-ink/20 sm:border-t-0' : ''}`}
            >
              <dt className={label}>{f.label}</dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="text-5xl font-semibold tracking-tighter leading-none text-ink">{f.value}</span>
                <span className="text-xs text-muted">{f.unit}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>Kemajuan HSK 1</span>
            <span><span className="text-ink font-semibold">{masteredCount}</span> dari {totalWords} kata</span>
          </div>
          <div
            className="flex h-1.5 w-full bg-ink/10"
            role="img"
            aria-label={`${masteredCount} dikuasai, ${learningCount} sedang diproses, dari ${totalWords} kata`}
          >
            <div className="bg-ink h-full transition-all duration-500" style={{ width: `${(masteredCount / totalWords) * 100}%` }} />
            <div className="hatch h-full transition-all duration-500" style={{ width: `${(learningCount / totalWords) * 100}%` }} />
          </div>
        </div>
      </Section>

      {/* 03 Tampilan */}
      <Section index="03" title="Tampilan" aside={isDark ? 'Mode gelap aktif' : 'Mode terang aktif'}>
        <p className="text-sm text-muted mb-3">Sesuaikan kenyamanan mata saat membaca dan menulis aksara.</p>
        <div role="group" aria-label="Tema" className="grid grid-cols-3 border border-ink divide-x divide-ink">
          {themeOptions.map(opt => {
            const on = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                aria-pressed={on}
                className={`py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${
                  on ? 'bg-ink text-paper font-semibold' : 'text-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* 04 Aplikasi */}
      <Section index="04" title="Aplikasi" aside={isStandalone ? 'Terpasang' : undefined}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-serif font-black text-5xl leading-none text-vermilion">汉</span>
            <div>
              <h3 className="text-sm font-semibold text-ink">HanziLearn (PWA)</h3>
              <p className="text-xs text-muted max-w-sm mt-0.5 leading-relaxed">
                {isStandalone
                  ? 'Berjalan dalam mode layar penuh (standalone).'
                  : 'Pasang ke layar utama HP atau desktop agar bisa diakses cepat seperti aplikasi bawaan.'}
              </p>
            </div>
          </div>
          {!isStandalone && (
            <button onClick={onInstallApp} className={`bg-ink text-paper px-5 py-2.5 text-xs font-semibold hover:bg-vermilion transition-colors self-start sm:self-center whitespace-nowrap ${focusRing}`}>
              Install di HP
            </button>
          )}
        </div>
      </Section>

      {/* 05 Data */}
      <Section index="05" title="Sinkronisasi & data">
        <ul className="border-t border-ink">
          {user && (
            <li className="border-b border-ink/20 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-ink">Sinkronisasi cloud sekarang</div>
                <div className="text-xs text-muted">Unggah dan gabungkan progres lokal terbaru ke server</div>
              </div>
              <button onClick={onManualSync} disabled={isSyncing} className={rowBtn}>
                {isSyncing ? 'Menyinkronkan…' : 'Sinkronkan'}
              </button>
            </li>
          )}
          <li className="border-b border-ink/20 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-ink">Reset progres belajar lokal</div>
              <div className="text-xs text-muted">Mengosongkan cache hafalan dan streak pada perangkat ini</div>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className={`border border-vermilion px-4 py-2 text-xs font-semibold text-vermilion hover:bg-vermilion hover:text-paper transition-colors whitespace-nowrap ${focusRing}`}
            >
              Reset
            </button>
          </li>
        </ul>
      </Section>

      {/* 06 Masukan */}
      <Section index="06" title="Kritik & saran">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Punya ide fitur baru, koreksi kata, atau kendala? Masukanmu sangat berharga bagi kami.
          </p>
          <button onClick={onOpenFeedback} className={`bg-ink text-paper px-5 py-2.5 text-xs font-semibold hover:bg-vermilion transition-colors self-start sm:self-center whitespace-nowrap ${focusRing}`}>
            Beri masukan
          </button>
        </div>
      </Section>

      {/* 07 Admin */}
      {isAdmin && (
        <Section index="07" title="Admin" aside="Akses admin">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Pantau statistik pengguna, analitik kosakata, dan baca pesan kritik dan saran.
            </p>
            <button onClick={onOpenAdmin} className={`bg-ink text-paper px-5 py-2.5 text-xs font-semibold hover:bg-vermilion transition-colors self-start sm:self-center whitespace-nowrap ${focusRing}`}>
              Buka panel admin
            </button>
          </div>
        </Section>
      )}

      {/* Footer */}
      <div
        onClick={() => {
          const next = versionClicks + 1;
          setVersionClicks(next);
          if (next >= 5) {
            setVersionClicks(0);
            onOpenAdmin();
          }
        }}
        className="border-t border-ink/20 pt-4 pb-4 text-xs text-muted space-y-0.5 cursor-default select-none"
      >
        <p className="font-semibold text-ink">HanziLearn &middot; Aksara Mandarin Mandiri</p>
        <p>Dibuat untuk pembelajaran HSK 1 dan piktogram aksara &middot; v2.1</p>
      </div>

      {/* Confirmation modals */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Keluar dari akun?"
        message="Progres belajarmu telah tersimpan aman di Google Cloud. Kamu dapat masuk kembali kapan saja untuk melanjutkan."
        confirmLabel="Ya, keluar"
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
        title="Reset progres belajar?"
        message="Perhatian: tindakan ini akan mengosongkan statistik belajar, hafalan kata, dan streak pada perangkat ini. Apakah kamu yakin?"
        confirmLabel="Hapus progres"
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
