import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Users, 
  PenTool, 
  Award, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Smartphone, 
  Monitor, 
  Trash2, 
  Lock, 
  Key,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
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

  // If not unlocked, show PIN verification gate
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Panel Admin HanziLearn
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Halaman ini dikhususkan untuk pengembang dan pemilik aplikasi.
            </p>
          </div>

          {user && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs text-stone-600 dark:text-stone-300">
              Masuk sebagai: <span className="font-semibold text-stone-900 dark:text-stone-100">{user.email}</span>
            </div>
          )}

          <form onSubmit={handleUnlockPin} className="space-y-3 pt-2">
            <div className="relative">
              <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Masukkan PIN Admin (Bawaan: 8888)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-red-600/30 font-mono tracking-widest text-center"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{pinError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Buka Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter feedback
  const filteredFeedback = (data?.feedbackList || []).filter(item => {
    if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) return false;
    if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
    return true;
  });

  // Filter users
  const filteredUsers = (data?.users || []).filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Navbar Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl text-stone-700 dark:text-stone-300 transition"
            title="Kembali ke Aplikasi Utama"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Panel Admin & Analitik</span>
              </h1>
              <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2 py-0.2 rounded-full font-bold border border-red-200 dark:border-red-900/50">
                Firestore Live
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Data analitik teragregasi langsung dari akun pengguna HanziLearn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {lastRefreshedTime && (
            <span className="text-[10px] text-stone-400 hidden sm:inline">
              Update: {lastRefreshedTime}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Users */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pengguna</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {loading ? '...' : data?.totalUsers || 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{data?.activeUsers7Days || 0} aktif 7 hari terakhir</span>
          </div>
        </div>

        {/* Card 2: Characters Written */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Karakter Digores</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {loading ? '...' : data?.totalCharactersWritten.toLocaleString('id-ID') || 0}
          </div>
          <div className="text-[11px] text-stone-400">
            Total goresan kuas selesai
          </div>
        </div>

        {/* Card 3: Quizzes & Accuracy */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Kuis Diambil</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {loading ? '...' : data?.totalQuizzesTaken.toLocaleString('id-ID') || 0}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Akurasi Rata-rata: {data?.averageAccuracy || 0}%
          </div>
        </div>

        {/* Card 4: Feedback & Rating */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Kritik & Saran</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {loading ? '...' : data?.feedbackStats.total || 0}
            </div>
            {data?.feedbackStats.newCount ? (
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                {data.feedbackStats.newCount} baru
              </span>
            ) : null}
          </div>
          <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Rating: {data?.feedbackStats.averageRating || 5.0} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Segmented Navigation */}
      <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-1 transition-colors">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Kritik & Saran ({data?.feedbackStats.total || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Daftar Pengguna ({data?.totalUsers || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'vocab'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Analitik Kosakata</span>
        </button>
      </div>

      {/* TAB 1: FEEDBACK INBOX */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {/* Filters for feedback */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <span className="text-[11px] text-stone-400 font-semibold mr-1">Kategori:</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'suggestion', label: 'Saran Fitur' },
                { id: 'bug', label: 'Lapor Bug' },
                { id: 'correction', label: 'Koreksi Aksara' },
                { id: 'review', label: 'Ulasan' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFeedbackCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    feedbackCategoryFilter === cat.id
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-stone-400 font-semibold mr-1">Status:</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'new', label: 'Baru' },
                { id: 'reviewed', label: 'Ditanggapi' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFeedbackStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    feedbackStatusFilter === st.id
                      ? 'bg-red-700 text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Cards List */}
          {filteredFeedback.length > 0 ? (
            <div className="space-y-3">
              {filteredFeedback.map((fb) => (
                <div 
                  key={fb.id}
                  className={`bg-white dark:bg-stone-900 rounded-3xl p-5 border transition-all ${
                    fb.status === 'new' 
                      ? 'border-red-300/80 dark:border-red-900/60 shadow-sm ring-1 ring-red-500/10' 
                      : 'border-stone-200 dark:border-stone-800 shadow-2xs'
                  }`}
                >
                  {/* Top line: Author info, category, rating, status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {fb.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {fb.userName}
                          </span>
                          {fb.userEmail && (
                            <span className="text-[11px] text-stone-400 truncate hidden min-[450px]:inline">
                              &bull; {fb.userEmail}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {new Date(fb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Rating stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>

                      {/* Category Badge */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {fb.category === 'suggestion' ? 'Saran Fitur' : fb.category === 'bug' ? 'Lapor Bug' : fb.category === 'correction' ? 'Koreksi Aksara' : 'Ulasan'}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fb.status === 'new' 
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50' 
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {fb.status === 'new' ? 'Belum Dibaca' : 'Sudah Ditinjau'}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed my-3 whitespace-pre-wrap">
                    {fb.message}
                  </p>

                  {/* Device info & Admin Actions */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {fb.deviceInfo ? (
                      <div className="flex items-center gap-2 text-[10px] text-stone-400">
                        {fb.deviceInfo.isStandalone ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Smartphone className="w-3 h-3" /> PWA Terpasang
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" /> Web Browser
                          </span>
                        )}
                        <span>&bull; {fb.deviceInfo.platform}</span>
                        <span>&bull; Mode {fb.deviceInfo.theme}</span>
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {fb.status === 'new' ? (
                        <button
                          onClick={() => handleUpdateStatus(fb.id!, 'reviewed')}
                          className="py-1 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Tandai Selesai Dibaca</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(fb.id!, 'new')}
                          className="py-1 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg text-xs font-medium transition"
                        >
                          Tandai Belum
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteFeedback(fb.id!)}
                        className="p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Hapus masukan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 text-center border border-stone-200 dark:border-stone-800 space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
              <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Belum Ada Pesan Masukan</h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Kotak masuk kritik & saran masih kosong untuk kategori atau status yang dipilih.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Cari pengguna berdasarkan nama, email, atau UID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 shadow-xs"
            />
          </div>

          {/* User Cards / List */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
              <span>Pengguna Terdaftar ({filteredUsers.length})</span>
              <span>Statistik Aktivitas</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div key={u.uid} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                        {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 dark:text-stone-100 truncate flex items-center gap-2">
                          <span>{u.displayName}</span>
                          {ADMIN_EMAILS.includes(u.email || '') && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-stone-400 text-[11px] truncate">{u.email || 'Tanpa Email'}</div>
                        <div className="text-stone-400 text-[10px] mt-0.5">
                          Aktif: {u.lastActiveDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center font-mono">
                      <div className="text-center px-2.5 py-1 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                        <div className="text-[10px] text-stone-400 uppercase font-sans font-semibold">Streak</div>
                        <div className="font-bold text-amber-600 dark:text-amber-400">{u.streakDays}h</div>
                      </div>

                      <div className="text-center px-2.5 py-1 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                        <div className="text-[10px] text-stone-400 uppercase font-sans font-semibold">Ditulis</div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{u.charactersWritten}</div>
                      </div>

                      <div className="text-center px-2.5 py-1 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                        <div className="text-[10px] text-stone-400 uppercase font-sans font-semibold">Hafal</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{u.masteredCount}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Tidak ditemukan pengguna dengan kata kunci tersebut.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOCABULARY LEARNING ANALYTICS */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Most Mastered Words */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  Top 8 Kata Paling Dikuasai
                </h3>
                <p className="text-[10px] text-stone-400">Kata HSK 1 yang paling banyak dihafalkan pengguna</p>
              </div>
            </div>

            <div className="space-y-2">
              {data?.mostMasteredWords && data.mostMasteredWords.length > 0 ? (
                data.mostMasteredWords.map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-400 w-4">#{idx + 1}</span>
                      <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{item.hanzi}</span>
                      <div>
                        <div className="text-xs font-bold text-red-700 dark:text-red-400">{item.pinyin}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">{item.indonesian}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-xl">
                      {item.count} pengguna
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-400">
                  Belum cukup data progres kata yang terkumpul.
                </div>
              )}
            </div>
          </div>

          {/* Most Struggled Words */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  Top 8 Kata Sering Diulang / Sulit
                </h3>
                <p className="text-[10px] text-stone-400">Kata yang paling sering di-review atau butuh latihan ulang</p>
              </div>
            </div>

            <div className="space-y-2">
              {data?.mostStruggledWords && data.mostStruggledWords.length > 0 ? (
                data.mostStruggledWords.map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-400 w-4">#{idx + 1}</span>
                      <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{item.hanzi}</span>
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">{item.pinyin}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">{item.indonesian}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-xl">
                      {item.count} kali diulang
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-400">
                  Belum ada kata yang tercatat sulit secara signifikan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
