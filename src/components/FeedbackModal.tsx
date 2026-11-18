import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { submitFeedback } from '../services/feedbackService';
import type { FeedbackCategory } from '../services/feedbackService';
import { Dialog } from './ui/Dialog';
import { focusRing } from './ui/marks';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

const CATEGORIES: { id: FeedbackCategory; label: string }[] = [
  { id: 'suggestion', label: 'Saran fitur' },
  { id: 'bug', label: 'Lapor bug' },
  { id: 'correction', label: 'Koreksi aksara' },
  { id: 'review', label: 'Ulasan & kesan' },
  { id: 'other', label: 'Lainnya' }
];

const RATING_LABELS = ['', 'Kurang Memuaskan', 'Cukup', 'Bagus', 'Sangat Bagus', 'Luar Biasa Membantu!'];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();

  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Silakan tuliskan kritik, saran, atau masukanmu terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const finalUserName = isAnonymous 
        ? 'Pengguna Anonim' 
        : (user?.displayName || guestName.trim() || 'Pembelajar Hanzi');

      await submitFeedback({
        category,
        rating,
        message: message.trim(),
        userName: finalUserName,
        userEmail: isAnonymous ? null : (user?.email || null),
        userId: user?.uid || null,
        deviceInfo: {
          platform: navigator.platform || 'unknown',
          isStandalone,
          theme: resolvedTheme,
          userAgent: navigator.userAgent
        }
      });

      setIsSuccess(true);
      if (onSuccessToast) {
        onSuccessToast('Terima kasih! Kritik & saranmu telah diterima admin.');
      }
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage('Terjadi kendala saat mengirim. Pastikan koneksi internetmu stabil.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setMessage('');
    setCategory('suggestion');
    setRating(5);
    setErrorMessage(null);
    onClose();
  };

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';
  const field = 'w-full bg-transparent border-b border-ink pb-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion disabled:opacity-40';

  return (
    <Dialog eyebrow="Kritik & saran" size="lg" onClose={handleResetAndClose}>
      <div className="p-5 sm:p-6">
        {isSuccess ? (
          <div className="py-6 animate-in fade-in">
            <div className="font-serif font-black text-7xl leading-none text-vermilion">谢</div>
            <h4 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Masukan terkirim</h4>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Terima kasih atas waktu dan masukanmu. Setiap kritik dan ide akan kami tinjau untuk pembaruan HanziLearn berikutnya.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className={`mt-6 bg-ink text-paper px-6 py-3 text-sm font-semibold flex items-center gap-8 hover:bg-vermilion transition-colors ${focusRing}`}
            >
              <span>Kembali belajar</span>
              <span aria-hidden>&rarr;</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-muted">Bantu kami menyempurnakan aplikasi belajar ini.</p>

            {/* Category */}
            <fieldset>
              <legend className={label}>Kategori</legend>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    aria-pressed={category === cat.id}
                    className={`pb-0.5 text-sm border-b-2 transition-colors ${focusRing} ${
                      category === cat.id ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Rating */}
            <fieldset>
              <legend className={label}>Pengalaman belajarmu</legend>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex border border-ink divide-x divide-ink" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map(n => {
                    const on = (hoverRating || rating) >= n;
                    return (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        aria-label={`Beri nilai ${n} dari 5`}
                        aria-pressed={rating === n}
                        className={`w-10 h-10 text-sm font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${
                          on ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-ink">{RATING_LABELS[hoverRating || rating]}</span>
              </div>
            </fieldset>

            {/* Message */}
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="feedback-text" className={label}>Pesan, kritik, atau saran</label>
                <span className="text-[10px] text-muted tabular-nums">{message.length} karakter</span>
              </div>
              <textarea
                id="feedback-text"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  category === 'bug'
                    ? 'Ceritakan kendala yang kamu temukan (misal: tombol audio macet di kata tertentu, garis goresan meleset)'
                    : category === 'suggestion'
                    ? 'Fitur atau materi apa yang paling ingin kamu tambahkan berikutnya?'
                    : category === 'correction'
                    ? 'Tuliskan kata, pinyin, atau terjemahan yang kurang tepat'
                    : 'Bagikan pengalaman atau saranmu untuk aplikasi ini'
                }
                className="mt-2 w-full p-3 bg-transparent border border-ink text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
              />
            </div>

            {/* Identity */}
            <div className="border-t border-ink pt-3 space-y-3">
              <div className="flex items-end justify-between gap-4 text-sm">
                <div className="min-w-0 flex-1">
                  <div className={label}>Pengirim</div>
                  {user ? (
                    <div className="mt-1 truncate">
                      <span className="font-semibold text-ink">{user.displayName || 'Pengguna terdaftar'}</span>
                      <span className="block text-xs text-muted truncate">{user.email}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Nama atau panggilan (opsional)"
                      aria-label="Nama atau panggilan"
                      disabled={isAnonymous}
                      className={`mt-1 ${field}`}
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="accent-[var(--vermilion)]"
                  />
                  <span>Anonim</span>
                </label>
              </div>
              <p className="text-[11px] text-muted">Pesan langsung terkirim ke pengembang dan admin HanziLearn.</p>
            </div>

            {errorMessage && (
              <div role="alert" className="border-l-2 border-vermilion pl-3 text-sm text-vermilion">{errorMessage}</div>
            )}

            <div className="flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={submitting}
                className={`text-sm text-muted underline underline-offset-4 decoration-1 hover:text-ink ${focusRing}`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className={`bg-ink text-paper px-6 py-3 text-sm font-semibold flex items-center gap-8 hover:bg-vermilion transition-colors disabled:opacity-40 disabled:pointer-events-none ${focusRing}`}
              >
                <span>{submitting ? 'Mengirim…' : 'Kirim masukan'}</span>
                <span aria-hidden>&rarr;</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};
