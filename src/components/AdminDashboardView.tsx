import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchAdminAnalytics, 
  checkIsAdmin, 
  ADMIN_EMAILS 
} from '../services/adminService';
import { 
  updateFeedbackStatus, 
  deleteFeedbackItem 
} from '../services/feedbackService';
import type { AdminAnalyticsData } from '../services/adminService';
import type { FeedbackStatus } from '../services/feedbackService';
import { focusRing } from './ui/tokens';

const WordList: React.FC<{ items: { id: string; hanzi: string; pinyin: string; indonesian: string; count: number }[] | undefined; unit: string; empty: string }> = ({ items, unit, empty }) =>
  items && items.length > 0 ? (
    <ol className="border-t border-ink">
      {items.map((item, idx) => (
        <li key={item.id} className="border-b border-ink/20 py-3 grid grid-cols-[2rem_4rem_1fr_auto] items-center gap-3">
          <span className="text-xs tabular-nums text-muted">{String(idx + 1).padStart(2, '0')}</span>
          <span className="font-serif font-black text-3xl leading-none text-ink whitespace-nowrap">{item.hanzi}</span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-vermilion">{item.pinyin}</span>
            <span className="block text-xs text-muted truncate">{item.indonesian}</span>
          </span>
          <span className="text-xs tabular-nums text-ink"><span className="font-semibold">{item.count}</span> <span className="text-muted">{unit}</span></span>
        </li>
      ))}
    </ol>
  ) : (
    <p className="border-y border-ink/20 py-8 text-center text-sm text-muted">{empty}</p>
  );

interface AdminDashboardViewProps {
  onClose: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onClose }) => {
  const { user } = useAuth();

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return checkIsAdmin(user?.email);
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'users' | 'vocab'>('feedback');
  
  // Feedback filter
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');

  // User search filter
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAnalytics();
      setData(res);
      setLastRefreshedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadData();
    }
  }, [isAdminUnlocked]);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '8888') {
      sessionStorage.setItem('hanzilearn_admin_unlocked', 'true');
      setIsAdminUnlocked(true);
      setPinError(null);
    } else {
      setPinError('PIN salah. Hubungi pemilik untuk kode akses admin.');
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          feedbackList: prev.feedbackList.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f),
          feedbackStats: {
            ...prev.feedbackStats,
            newCount: newStatus !== 'new' ? Math.max(0, prev.feedbackStats.newCount - 1) : prev.feedbackStats.newCount
          }
        };
      });
    } catch (err) {
      console.error('Failed to update feedback status:', err);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Hapus pesan masukan ini secara permanen?')) return;
    try {
      await deleteFeedbackItem(feedbackId);
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          feedbackList: prev.feedbackList.filter(f => f.id !== feedbackId),
          feedbackStats: {
            ...prev.feedbackStats,
            total: Math.max(0, prev.feedbackStats.total - 1)
          }
        };
      });
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';
  const solidBtn = `bg-ink text-paper px-5 py-2.5 text-xs font-semibold hover:bg-vermilion transition-colors disabled:opacity-40 disabled:pointer-events-none ${focusRing}`;
  const lineBtn = `border border-ink px-4 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 disabled:pointer-events-none ${focusRing}`;
  const tabBtn = (on: boolean) =>
    `pb-1 border-b-2 whitespace-nowrap transition-colors ${focusRing} ${on ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'}`;

  // PIN verification gate
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto py-8 animate-in fade-in">
        <div className="border-t-2 border-ink pt-3">
          <span className={label}>Akses terbatas</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Panel admin</h2>
          <p className="mt-2 text-sm text-muted">Halaman ini dikhususkan untuk pengembang dan pemilik aplikasi.</p>

          {user && (
            <p className="mt-4 text-xs text-muted">
              Masuk sebagai <span className="font-semibold text-ink">{user.email}</span>
            </p>
          )}

          <form onSubmit={handleUnlockPin} className="mt-6 space-y-5">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Masukkan PIN Admin (Bawaan: 8888)"
              aria-label="PIN admin"
              className="w-full bg-transparent border-b-2 border-ink pb-2 text-center font-mono tracking-widest text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
            />
            {pinError && <p role="alert" className="border-l-2 border-vermilion pl-3 text-xs text-vermilion">{pinError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={onClose} className={lineBtn}>Kembali</button>
              <button type="submit" className={solidBtn}>Buka panel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredFeedback = (data?.feedbackList || []).filter(item => {
    if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) return false;
    if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
    return true;
  });

  const filteredUsers = (data?.users || []).filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  const categoryLabel = (c: string) =>
    c === 'suggestion' ? 'Saran fitur' : c === 'bug' ? 'Lapor bug' : c === 'correction' ? 'Koreksi aksara' : 'Ulasan';

  const figures = [
    { label: 'Total pengguna', value: loading ? '…' : String(data?.totalUsers || 0), note: `${data?.activeUsers7Days || 0} aktif 7 hari terakhir` },
    { label: 'Karakter digores', value: loading ? '…' : (data?.totalCharactersWritten.toLocaleString('id-ID') || '0'), note: 'Total goresan kuas selesai' },
    { label: 'Kuis diambil', value: loading ? '…' : (data?.totalQuizzesTaken.toLocaleString('id-ID') || '0'), note: `Akurasi rata-rata ${data?.averageAccuracy || 0}%` },
    { label: 'Kritik & saran', value: loading ? '…' : String(data?.feedbackStats.total || 0), note: `${data?.feedbackStats.newCount ? `${data.feedbackStats.newCount} baru · ` : ''}Rating ${data?.feedbackStats.averageRating || 5.0} / 5.0` }
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in">
      {/* Masthead */}
      <header className="border-t-2 border-ink pt-3">
        <div className="flex items-baseline justify-between">
          <span className={label}>Admin · Firestore live</span>
          {lastRefreshedTime && <span className={`${label} tabular-nums`}>Update {lastRefreshedTime}</span>}
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">Panel admin &amp; analitik</h1>
            <p className="mt-1 text-sm text-muted">Data analitik teragregasi langsung dari akun pengguna HanziLearn.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={onClose} className={lineBtn} title="Kembali ke aplikasi utama">Kembali</button>
            <button onClick={loadData} disabled={loading} className={solidBtn}>{loading ? 'Memuat…' : 'Segarkan'}</button>
          </div>
        </div>
      </header>

      {/* Figures */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 border-t border-ink">
        {figures.map((f, i) => (
          <div key={f.label} className={`py-4 pr-3 ${i % 2 === 1 ? 'pl-4 border-l border-ink/20' : ''} ${i > 0 ? 'lg:pl-4 lg:border-l lg:border-ink/20' : ''} ${i >= 2 ? 'border-t border-ink/20 lg:border-t-0' : ''}`}>
            <dt className={label}>{f.label}</dt>
            <dd className="mt-1 text-4xl sm:text-5xl font-semibold tracking-tighter leading-none text-ink">{f.value}</dd>
            <dd className="mt-2 text-xs text-muted">{f.note}</dd>
          </div>
        ))}
      </dl>

      {/* Tabs */}
      <div role="tablist" aria-label="Bagian panel" className="flex gap-6 text-sm overflow-x-auto border-b border-ink/20">
        {([
          ['feedback', `Kritik & saran (${data?.feedbackStats.total || 0})`],
          ['users', `Pengguna (${data?.totalUsers || 0})`],
          ['vocab', 'Analitik kosakata']
        ] as const).map(([id, name]) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={tabBtn(activeTab === id)}>
            {name}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-xs">
            <div className="flex items-center gap-4 overflow-x-auto">
              <span className={label}>Kategori</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'suggestion', label: 'Saran fitur' },
                { id: 'bug', label: 'Lapor bug' },
                { id: 'correction', label: 'Koreksi aksara' },
                { id: 'review', label: 'Ulasan' }
              ].map(cat => (
                <button key={cat.id} onClick={() => setFeedbackCategoryFilter(cat.id)} aria-pressed={feedbackCategoryFilter === cat.id} className={tabBtn(feedbackCategoryFilter === cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className={label}>Status</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'new', label: 'Baru' },
                { id: 'reviewed', label: 'Ditanggapi' }
              ].map(st => (
                <button key={st.id} onClick={() => setFeedbackStatusFilter(st.id)} aria-pressed={feedbackStatusFilter === st.id} className={tabBtn(feedbackStatusFilter === st.id)}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {filteredFeedback.length > 0 ? (
            <ul className="border-t border-ink">
              {filteredFeedback.map((fb) => (
                <li key={fb.id} className="relative border-b border-ink/20 py-5">
                  {fb.status === 'new' && <span aria-hidden className="absolute -left-3 top-0 bottom-0 w-1 bg-vermilion" />}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-ink">{fb.userName}</span>
                      {fb.userEmail && <span className="text-xs text-muted"> · {fb.userEmail}</span>}
                      <div className="text-[11px] text-muted">
                        {new Date(fb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-[11px] font-medium uppercase tracking-[0.14em]">
                      <span className="text-ink tabular-nums" aria-label={`Rating ${fb.rating} dari 5`}>{fb.rating}/5</span>
                      <span className="text-muted">{categoryLabel(fb.category)}</span>
                      <span className={fb.status === 'new' ? 'text-vermilion font-semibold' : 'text-muted'}>
                        {fb.status === 'new' ? 'Belum dibaca' : 'Sudah ditinjau'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink whitespace-pre-wrap">{fb.message}</p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {fb.deviceInfo ? (
                      <span className="text-[11px] text-muted">
                        {fb.deviceInfo.isStandalone ? 'PWA terpasang' : 'Web browser'} · {fb.deviceInfo.platform} · mode {fb.deviceInfo.theme}
                      </span>
                    ) : <span />}
                    <div className="flex items-center gap-4">
                      {fb.status === 'new' ? (
                        <button onClick={() => handleUpdateStatus(fb.id!, 'reviewed')} className={lineBtn}>Tandai selesai dibaca</button>
                      ) : (
                        <button onClick={() => handleUpdateStatus(fb.id!, 'new')} className={`text-muted underline underline-offset-4 decoration-1 hover:text-ink ${focusRing}`}>
                          Tandai belum
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFeedback(fb.id!)}
                        className={`text-vermilion underline underline-offset-4 decoration-1 hover:text-ink ${focusRing}`}
                        title="Hapus masukan ini"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-y border-ink/20 py-12 text-center">
              <h4 className="text-sm font-semibold text-ink">Belum ada pesan masukan</h4>
              <p className="mt-1 text-xs text-muted">Kotak masuk masih kosong untuk kategori atau status yang dipilih.</p>
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama, email, atau UID"
            aria-label="Cari pengguna"
            className="w-full bg-transparent border-b border-ink pb-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
          />

          <div>
            <div className={`flex justify-between border-t border-ink pt-3 ${label}`}>
              <span>Pengguna terdaftar ({filteredUsers.length})</span>
              <span>Aktivitas</span>
            </div>
            {filteredUsers.length > 0 ? (
              <ul className="mt-2">
                {filteredUsers.map((u) => (
                  <li key={u.uid} className="border-b border-ink/20 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <span className="truncate">{u.displayName}</span>
                        {ADMIN_EMAILS.includes(u.email || '') && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vermilion border border-vermilion px-1.5">Admin</span>
                        )}
                      </div>
                      <div className="text-xs text-muted truncate">{u.email || 'Tanpa email'}</div>
                      <div className="text-[11px] text-muted">Aktif {u.lastActiveDate}</div>
                    </div>
                    <dl className="flex gap-6 text-right">
                      {[
                        ['Streak', `${u.streakDays}h`],
                        ['Ditulis', String(u.charactersWritten)],
                        ['Hafal', String(u.masteredCount)]
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className={label}>{k}</dt>
                          <dd className="text-xl font-semibold tracking-tight tabular-nums text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-b border-ink/20 py-8 text-center text-sm text-muted">Tidak ditemukan pengguna dengan kata kunci tersebut.</p>
            )}
          </div>
        </div>
      )}

      {/* VOCAB */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          <section>
            <div className="border-t-2 border-ink pt-3 pb-3">
              <h3 className="text-lg font-semibold tracking-tight text-ink">Top 8 kata paling dikuasai</h3>
              <p className="text-xs text-muted">Kata HSK 1 yang paling banyak dihafalkan pengguna</p>
            </div>
            <WordList items={data?.mostMasteredWords} unit="pengguna" empty="Belum cukup data progres kata yang terkumpul." />
          </section>
          <section>
            <div className="border-t-2 border-ink pt-3 pb-3">
              <h3 className="text-lg font-semibold tracking-tight text-ink">Top 8 kata sering diulang / sulit</h3>
              <p className="text-xs text-muted">Kata yang paling sering di-review atau butuh latihan ulang</p>
            </div>
            <WordList items={data?.mostStruggledWords} unit="kali diulang" empty="Belum ada kata yang tercatat sulit secara signifikan." />
          </section>
        </div>
      )}
    </div>
  );
};
