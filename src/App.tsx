import { useState, useEffect, useMemo } from 'react';
import { 
  Home,
  BookOpen, 
  HelpCircle, 
  Search, 
  Compass,
  LayoutGrid,
  List,
  Maximize2,
  Download,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { HSK1_VOCABULARY } from './data/hsk1';
import { LESSON_UNITS } from './data/lessonUnits';
import type { VocabItem, MasteryStatus, UserStats } from './types';
import { 
  getAllProgress, 
  saveWordProgress, 
  getUserStats, 
  recordActivity, 
  getBookmarks, 
  toggleBookmark 
} from './utils/storage';
import { useAuth } from './context/AuthContext';
import { syncUserData, saveToCloud } from './utils/cloudSync';
import { HomeDashboardView } from './components/HomeDashboardView';
import { VocabCard } from './components/VocabCard';
import { FocusFlashcardView } from './components/FocusFlashcardView';
import { CompactListView } from './components/CompactListView';
import { StoriesAndRadicalsView, type StorySubTab } from './components/StoriesAndRadicalsView';
import { WritingModal } from './components/WritingModal';
import { QuizMode } from './components/QuizMode';
import { InstallPwaModal } from './components/InstallPwaModal';
import { UnitSelectorDropdown } from './components/UnitSelectorDropdown';
import { BottomNavBar, type NavTab } from './components/BottomNavBar';
import { ProfileView } from './components/ProfileView';
import { Toast, type ToastMessage } from './components/Toast';
import { FeedbackModal } from './components/FeedbackModal';
import { AdminDashboardView } from './components/AdminDashboardView';

type ViewMode = 'focus' | 'compact' | 'grid';
type FilterStatusType = 'all' | 'new' | 'learning' | 'mastered' | 'bookmarked';

export function App() {
  const { user, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // PWA installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [storySubTab, setStorySubTab] = useState<StorySubTab>('stories');
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-1'); // Default Bab 1: 10 kata
  const [activeWordId, setActiveWordId] = useState<string | undefined>(undefined);
  
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');

  // Modal for writing practice
  const [writingModalVocab, setWritingModalVocab] = useState<VocabItem | null>(null);

  // Feedback & Admin states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ id: Date.now().toString(), type, message });
  };

  // PWA detection & event listener
  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(Boolean(checkStandalone));

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(false);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Load local progress on mount
  useEffect(() => {
    setProgress(getAllProgress());
    setStats(getUserStats());
    setBookmarks(getBookmarks());
  }, []);

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (user) {
      syncUserData(
        user.uid,
        progress,
        stats,
        bookmarks,
        { email: user.email, displayName: user.displayName }
      ).then((merged) => {
        setProgress(merged.progress);
        setStats(merged.stats);
        setBookmarks(merged.bookmarks);
        showToast('success', `Tersinkron dengan akun Google (${user.displayName?.split(' ')[0] || 'User'})`);
      });
    }
  }, [user]);

  // Update word mastery status
  const handleStatusChange = (wordId: string, status: MasteryStatus) => {
    const updated = saveWordProgress(wordId, status);
    const newProgress = { ...progress, [wordId]: updated };
    setProgress(newProgress);

    if (user) {
      saveToCloud(user.uid, { progress: newProgress });
    }
  };

  // Toggle bookmark star
  const handleToggleBookmark = (wordId: string) => {
    const updated = toggleBookmark(wordId);
    setBookmarks(updated);
    const isNowBookmarked = updated.includes(wordId);
    showToast('info', isNowBookmarked ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');

    if (user) {
      saveToCloud(user.uid, { bookmarks: updated });
    }
  };

  // Reset local progress
  const handleResetProgress = () => {
    localStorage.removeItem('mandarin_hsk_progress');
    localStorage.removeItem('mandarin_hsk_stats');
    localStorage.removeItem('mandarin_hsk_bookmarks');
    setProgress({});
    setStats({
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      charactersWritten: 0,
      totalQuizzesTaken: 0,
      correctQuizAnswers: 0
    });
    setBookmarks([]);
    showToast('info', 'Progres belajar lokal berhasil direset.');
  };

  // Manual cloud sync
  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const merged = await syncUserData(
        user.uid,
        progress,
        stats,
        bookmarks,
        { email: user.email, displayName: user.displayName }
      );
      setProgress(merged.progress);
      setStats(merged.stats);
      setBookmarks(merged.bookmarks);
      showToast('success', 'Data berhasil disinkronkan ke Google Cloud!');
    } catch {
      showToast('error', 'Gagal menyinkronkan data.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Called when writing canvas finishes a character
  const handleCharacterCompleted = (_char: string, mistakes: number) => {
    const newStats = recordActivity(1, 0, 0);
    setStats(newStats);

    let updatedProgress = progress;
    if (writingModalVocab) {
      const currentStatus = progress[writingModalVocab.id]?.status || 'learning';
      const updated = saveWordProgress(
        writingModalVocab.id, 
        currentStatus === 'new' ? 'learning' : currentStatus, 
        1, 
        mistakes
      );
      updatedProgress = { ...progress, [writingModalVocab.id]: updated };
      setProgress(updatedProgress);
    }

    if (user) {
      saveToCloud(user.uid, { stats: newStats, progress: updatedProgress });
    }
  };

  // Quiz finish handler
  const handleFinishQuiz = (correctCount: number, totalQuestions: number) => {
    const newStats = recordActivity(0, correctCount, totalQuestions);
    setStats(newStats);

    if (user) {
      saveToCloud(user.uid, { stats: newStats });
    }
  };

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    return HSK1_VOCABULARY.filter(item => {
      // Unit filter (if not "all")
      if (selectedUnitId !== 'all') {
        const unit = LESSON_UNITS.find(u => u.id === selectedUnitId);
        if (unit && !unit.wordIds.includes(item.id)) {
          return false;
        }
      }

      // Status match
      const itemStatus = progress[item.id]?.status || 'new';
      if (statusFilter === 'bookmarked') {
        if (!bookmarks.includes(item.id)) return false;
      } else if (statusFilter !== 'all') {
        if (itemStatus !== statusFilter) return false;
      }

      // Search match (hanzi, pinyin, or indonesian meaning)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchHanzi = item.hanzi.includes(query);
        const matchPinyin = item.pinyin.toLowerCase().includes(query);
        const matchIndo = item.indonesian.toLowerCase().includes(query);
        const matchEng = item.english.toLowerCase().includes(query);
        return matchHanzi || matchPinyin || matchIndo || matchEng;
      }

      return true;
    });
  }, [selectedUnitId, statusFilter, searchQuery, progress, bookmarks]);

  // Compute counts for stats
  const masteredCount = useMemo(() => {
    return Object.values(progress).filter((p: any) => p.status === 'mastered').length;
  }, [progress]);

  const learningCount = useMemo(() => {
    return Object.values(progress).filter((p: any) => p.status === 'learning').length;
  }, [progress]);

  // Index navigation for Writing Modal
  const currentModalIndex = writingModalVocab 
    ? filteredVocab.findIndex(v => v.id === writingModalVocab.id) 
    : -1;

  const handlePrevVocab = currentModalIndex > 0 
    ? () => setWritingModalVocab(filteredVocab[currentModalIndex - 1]) 
    : undefined;

  const handleNextVocab = currentModalIndex >= 0 && currentModalIndex < filteredVocab.length - 1 
    ? () => setWritingModalVocab(filteredVocab[currentModalIndex + 1]) 
    : undefined;

  const currentUnit = LESSON_UNITS.find(u => u.id === selectedUnitId);

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pb-20 font-sans transition-colors duration-150">
      {/* Top Navbar: Mobile-optimized sticky navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" onClick={() => { setShowAdminDashboard(false); setActiveTab('home'); }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-700 text-white font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md">
                汉
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight">HanziLearn</span>
                <span className="hidden lg:inline-block ml-2 text-[11px] bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                  HSK 1 & Piktogram
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl text-xs lg:text-sm font-medium text-stone-600 dark:text-stone-400">
              <button
                onClick={() => { setShowAdminDashboard(false); setActiveTab('home'); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  !showAdminDashboard && activeTab === 'home' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Home className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                <span>Beranda</span>
              </button>

              <button
                onClick={() => { setShowAdminDashboard(false); setActiveTab('flashcards'); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  !showAdminDashboard && activeTab === 'flashcards' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                <span>Belajar</span>
              </button>

              <button
                onClick={() => { setShowAdminDashboard(false); setActiveTab('stories'); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  !showAdminDashboard && activeTab === 'stories' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Aksara & Radikal</span>
              </button>

              <button
                onClick={() => { setShowAdminDashboard(false); setActiveTab('quiz'); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  !showAdminDashboard && activeTab === 'quiz' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Kuis</span>
              </button>

              <button
                onClick={() => { setShowAdminDashboard(false); setActiveTab('profile'); }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  !showAdminDashboard && activeTab === 'profile' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <User className="w-4 h-4 text-stone-700 dark:text-stone-300 flex-shrink-0" />
                <span>Profil</span>
              </button>
            </nav>

            {/* Right Side Actions: Theme Toggle + PWA Install + User Avatar / Login */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Theme Toggle Button (Available everywhere) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition active:scale-95 shadow-2xs"
                title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-600" />
                )}
              </button>

              {/* Desktop 1-Click PWA Install Button */}
              {!isStandalone && (
                <button
                  onClick={handleTriggerInstall}
                  className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs"
                  title="Pasang aplikasi HanziLearn di laptop / HP kamu"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang App</span>
                </button>
              )}

              {/* Google Login / Avatar button (taps directly to Profile tab) */}
              {user ? (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 p-1 pl-2 rounded-full transition border active:scale-95 ${
                    activeTab === 'profile'
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 ring-2 ring-red-100 dark:ring-red-950/60'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
                  }`}
                  title="Buka profil akun & statistik"
                >
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 hidden sm:inline max-w-[90px] truncate">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-7 h-7 rounded-full object-cover border border-white dark:border-stone-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold text-xs flex items-center justify-center">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => loginWithGoogle()}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition shadow-xs active:scale-95"
                  title="Masuk dengan Google"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Masuk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-5 pb-24 md:pb-12 space-y-6">
        {showAdminDashboard ? (
          <AdminDashboardView onClose={() => setShowAdminDashboard(false)} />
        ) : (
          <>
            {/* TAB 0: BERANDA / DASHBOARD */}
            {activeTab === 'home' && (
          <HomeDashboardView
            stats={stats}
            totalWords={HSK1_VOCABULARY.length}
            masteredCount={masteredCount}
            learningCount={learningCount}
            selectedUnitId={selectedUnitId}
            progress={progress}
            onStartUnit={(unitId) => {
              setSelectedUnitId(unitId);
              setActiveWordId(undefined);
            }}
            onNavigateTab={(tab, subTab) => {
              if (subTab) {
                setStorySubTab(subTab);
              }
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 1: KOSAKATA & FLASHCARD */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Bab / Unit Selector Pill Bar (Anti-Overload!) */}
            <div className="bg-white dark:bg-stone-900 p-3.5 sm:p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                    Pilih Bab Belajar:
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base flex items-center gap-1.5 mt-0.5">
                    <span>{currentUnit ? `${currentUnit.icon} ${currentUnit.title}` : 'Semua Bab (130 Kata)'}</span>
                    {currentUnit && (
                      <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                        &bull; {currentUnit.wordIds.length} kata
                      </span>
                    )}
                  </h3>
                </div>

                {/* View Mode Switcher: Fokus (1 Kartu) vs List Ringkas vs Grid */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setViewMode('focus')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'focus' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="Mode fokus belajar 1 kartu per waktu"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                    <span>Fokus 1 Kartu</span>
                  </button>

                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'compact' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="Tampilan daftar ringkas hemat ruang"
                  >
                    <List className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Daftar</span>
                  </button>

                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'grid' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="Tampilan grid kartu lengkap"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {/* Mobile View: Custom Dropdown with Bab & Vocab Search */}
              <div className="sm:hidden">
                <UnitSelectorDropdown
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={(unitId) => {
                    setSelectedUnitId(unitId);
                    setActiveWordId(undefined);
                  }}
                  onSelectWord={(word) => {
                    setActiveWordId(word.id);
                  }}
                />
              </div>

              {/* Desktop / Tablet View: Horizontal Pill Bar */}
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedUnitId('all')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition font-medium ${
                    selectedUnitId === 'all'
                      ? 'bg-stone-900 dark:bg-stone-800 text-white shadow-xs font-bold border border-stone-900 dark:border-stone-700'
                      : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  Semua Kata (130)
                </button>

                {LESSON_UNITS.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 font-medium ${
                        isSelected
                          ? 'bg-red-700 text-white shadow-xs font-bold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <span>{unit.icon}</span>
                      <span>Bab {unit.unitNumber}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Search & Status filters if on Compact or Grid view */}
              {viewMode !== 'focus' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata di bab ini..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto text-xs">
                    {(['all', 'mastered', 'learning', 'bookmarked'] as FilterStatusType[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1.5 rounded-xl border whitespace-nowrap text-xs transition ${
                          statusFilter === st
                            ? 'bg-stone-900 dark:bg-stone-800 text-white border-stone-900 dark:border-stone-600 font-semibold shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                        }`}
                      >
                        {st === 'all' ? 'Semua' : st === 'mastered' ? 'Hafal' : st === 'learning' ? 'Belajar' : 'Favorit'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VIEW MODE 1: FOCUS FLASHCARD 1-BY-1 (Default: Bersih, Santai, Tidak Overload) */}
            {viewMode === 'focus' && (
              <div className="py-2">
                <FocusFlashcardView
                  vocabList={filteredVocab}
                  progress={progress}
                  bookmarks={bookmarks}
                  onStatusChange={handleStatusChange}
                  onToggleBookmark={handleToggleBookmark}
                  onCharacterCompleted={handleCharacterCompleted}
                  activeWordId={activeWordId}
                />
              </div>
            )}

            {/* VIEW MODE 2: COMPACT LIST (Daftar Rapi, Hemat Ruang di Mobile) */}
            {viewMode === 'compact' && (
              <div className="animate-in fade-in">
                {filteredVocab.length > 0 ? (
                  <CompactListView
                    vocabList={filteredVocab}
                    progress={progress}
                    bookmarks={bookmarks}
                    onStatusChange={handleStatusChange}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenWritingPractice={(vocab) => setWritingModalVocab(vocab)}
                  />
                ) : (
                  <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 text-center text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-800">
                    Tidak ada kata yang sesuai.
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 3: GRID (Kartu Lengkap) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
                {filteredVocab.map((item) => (
                  <VocabCard
                    key={item.id}
                    vocab={item}
                    status={progress[item.id]?.status || 'new'}
                    isBookmarked={bookmarks.includes(item.id)}
                    onStatusChange={(status) => handleStatusChange(item.id, status)}
                    onToggleBookmark={() => handleToggleBookmark(item.id)}
                    onOpenWritingPractice={(vocab) => setWritingModalVocab(vocab)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASAL-USUL HURUF, RADIKAL & TULIS BEBAS */}
        {activeTab === 'stories' && (
          <StoriesAndRadicalsView
            activeSubTab={storySubTab}
            onSubTabChange={setStorySubTab}
          />
        )}

        {/* TAB 3: KUIS INTERAKTIF */}
        {activeTab === 'quiz' && (
          <div className="animate-in fade-in">
            <QuizMode
              vocabList={HSK1_VOCABULARY}
              onFinishQuiz={handleFinishQuiz}
              onExit={() => setActiveTab('flashcards')}
            />
          </div>
        )}

        {/* TAB 6: PROFIL PENGGUNA & PENGATURAN */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in">
            <ProfileView
              stats={stats}
              totalWords={HSK1_VOCABULARY.length}
              masteredCount={masteredCount}
              learningCount={learningCount}
              isStandalone={isStandalone}
              onInstallApp={handleTriggerInstall}
              onResetProgress={handleResetProgress}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
              onOpenFeedback={() => setShowFeedbackModal(true)}
              onOpenAdmin={() => setShowAdminDashboard(true)}
            />
          </div>
        )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (No emojis, ergonomic thumb zone) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setShowAdminDashboard(false);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userPhotoUrl={user?.photoURL}
      />

      {/* Toast Notification Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* User Feedback & Critique Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSuccessToast={(msg) => showToast('success', msg)}
      />

      {/* Writing Practice Focused Modal */}
      <WritingModal
        vocab={writingModalVocab}
        isOpen={writingModalVocab !== null}
        onClose={() => setWritingModalVocab(null)}
        onPrev={handlePrevVocab}
        onNext={handleNextVocab}
        onCharacterCompleted={handleCharacterCompleted}
      />

      {/* PWA 1-Click Installation Dialog Modal */}
      <InstallPwaModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={handleTriggerInstall}
        isIos={isIos}
      />
    </div>
  );
}

export default App;
