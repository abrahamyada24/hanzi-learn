import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Star, 
  Lightbulb, 
  Bug, 
  FileEdit, 
  Heart, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { submitFeedback } from '../services/feedbackService';
import type { FeedbackCategory } from '../services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'suggestion', label: 'Saran Fitur', icon: Lightbulb },
  { id: 'bug', label: 'Lapor Bug', icon: Bug },
  { id: 'correction', label: 'Koreksi Aksara', icon: FileEdit },
  { id: 'review', label: 'Ulasan & Kesan', icon: Heart },
  { id: 'other', label: 'Lainnya', icon: MessageSquare }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Kritik & Saran HanziLearn
              </h3>
              <p className="text-[11px] text-stone-400">
                Bantu kami menyempurnakan aplikasi belajar ini
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Masukan Berhasil Terkirim!
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                Terima kasih banyak atas waktu dan masukannya. Setiap kritik dan ide darimu akan kami tinjau langsung untuk update HanziLearn berikutnya!
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2.5 px-6 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-2xl shadow-sm transition active:scale-95"
                >
                  Kembali Belajar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  Pilih Kategori Masukan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                          isSelected
                            ? 'bg-red-700 text-white border-red-700 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-700/80 text-center space-y-1.5">
                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  Bagaimana pengalamanmu belajar dengan HanziLearn?
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-115 focus:outline-none"
                        aria-label={`Beri rating ${star} bintang`}
                      >
                        <Star 
                          className={`w-6 h-6 transition-colors ${
                            active 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                              : 'text-stone-300 dark:text-stone-600'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 h-4">
                  {RATING_LABELS[hoverRating || rating]}
                </div>
              </div>

              {/* Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="feedback-text" className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Pesan, Kritik, atau Saran:
                  </label>
                  <span className="text-[10px] text-stone-400">
                    {message.length} karakter
                  </span>
                </div>
                <textarea
                  id="feedback-text"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === 'bug'
                      ? 'Ceritakan kendala yang kamu temukan (misal: tombol audio macet di kata tertentu, garis goresan meleset)...'
                      : category === 'suggestion'
                      ? 'Apa fitur atau materi yang paling ingin kamu tambahkan di HanziLearn berikutnya?...'
                      : category === 'correction'
                      ? 'Tuliskan kata, pinyin, atau terjemahan yang kurang tepat...'
                      : 'Bagikan pengalaman atau saranmu untuk aplikasi ini...'
                  }
                  className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-500 transition-colors"
                />
              </div>

              {/* Sender Identity Info */}
              <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl border border-stone-200/70 dark:border-stone-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserIcon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    {user ? (
                      <div className="truncate">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{user.displayName || 'Pengguna Terdaftar'}</span>
                        <span className="text-stone-400 text-[11px] block truncate">{user.email}</span>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Nama atau Panggilan (Opsional)"
                          disabled={isAnonymous}
                          className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 cursor-pointer select-none ml-2 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Anonim</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Pesan langsung terkirim ke pengembang & admin HanziLearn</span>
                </div>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={submitting}
                  className="py-2.5 px-4 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="py-2.5 px-5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Masukan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
