import { useState, useEffect, useMemo } from 'react';
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
    <div className="min-h-screen bg-paper text-ink pb-20 font-sans">
      {/* Top Navbar: Swiss editorial masthead */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-ink">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Wordmark */}
            <button
              className="flex items-baseline gap-2 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermilion"
              onClick={() => { setShowAdminDashboard(false); setActiveTab('home'); }}
              aria-label="HanziLearn, ke Beranda"
            >
              <span className="font-serif font-black text-2xl leading-none text-vermilion">汉</span>
              <span className="font-semibold text-base tracking-tight text-ink">HanziLearn</span>
            </button>

            {/* Desktop navigation (hidden on mobile) */}
            <nav className="hidden md:flex items-stretch gap-6 self-stretch text-sm" aria-label="Navigasi utama">
              {([
                ['home', 'Beranda'],
                ['flashcards', 'Belajar'],
                ['stories', 'Aksara & Radikal'],
                ['quiz', 'Kuis'],
                ['profile', 'Profil']
              ] as const).map(([id, label], i) => {
                const active = !showAdminDashboard && activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setShowAdminDashboard(false); setActiveTab(id); }}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-vermilion ${
                      active ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span className={`text-[10px] tabular-nums ${active ? 'text-vermilion' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{label}</span>
                    {active && <span aria-hidden className="absolute -bottom-px left-0 right-0 h-0.5 bg-vermilion" />}
                  </button>
                );
              })}
            </nav>

            {/* Right side: theme, install, account */}
            <div className="flex items-center gap-4 flex-shrink-0 text-xs font-medium">
              <button
                onClick={toggleTheme}
                className="text-muted hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
                title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                aria-label="Toggle dark mode"
              >
                {isDark ? 'Terang' : 'Gelap'}
              </button>

              {!isStandalone && (
                <button
                  onClick={handleTriggerInstall}
                  className="hidden sm:inline text-muted hover:text-vermilion underline underline-offset-4 decoration-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
                  title="Pasang aplikasi HanziLearn di laptop / HP kamu"
                >
                  Pasang app
                </button>
              )}

              {user ? (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
                  title="Buka profil akun & statistik"
                >
                  <span className={`hidden sm:inline max-w-[90px] truncate ${activeTab === 'profile' ? 'text-vermilion' : 'text-ink'}`}>
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 object-cover border border-ink" />
                  ) : (
                    <span className="w-7 h-7 bg-ink text-paper font-semibold text-xs flex items-center justify-center">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => loginWithGoogle()}
                  className="border border-ink text-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
                  title="Masuk dengan Google"
                >
                  Masuk
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
          <div className="space-y-8 animate-in fade-in">
            <div className="space-y-5">
              <div className="border-t-2 border-ink pt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Belajar &mdash; pilih bab</div>
                  <h2 className="mt-1 flex items-baseline gap-3 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                    {currentUnit && <span className="text-vermilion tabular-nums">{String(currentUnit.unitNumber).padStart(2, '0')}</span>}
                    <span>{currentUnit ? currentUnit.title.replace(/^Bab\s*\d+\s*:\s*/i, '') : 'Semua bab'}</span>
                    <span className="text-xs font-normal text-muted">{currentUnit ? currentUnit.wordIds.length : 130} kata</span>
                  </h2>
                </div>

                {/* View mode: text tabs */}
                <div role="tablist" aria-label="Mode tampilan" className="flex gap-5 text-sm self-start sm:self-auto">
                  {([
                    ['focus', 'Fokus', 'Mode fokus belajar 1 kartu per waktu'],
                    ['compact', 'Daftar', 'Tampilan daftar ringkas hemat ruang'],
                    ['grid', 'Grid', 'Tampilan grid kartu lengkap']
                  ] as const).map(([mode, label, tip]) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={viewMode === mode}
                      onClick={() => setViewMode(mode)}
                      title={tip}
                      className={`pb-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion ${
                        viewMode === mode ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile: dropdown with bab and vocab search */}
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

              {/* Desktop / tablet: numbered chapter strip */}
              <div className="hidden sm:flex flex-wrap items-center gap-x-1 gap-y-1 text-sm" role="tablist" aria-label="Pilih bab">
                {[{ id: 'all', label: 'Semua' }, ...LESSON_UNITS.map(u => ({ id: u.id, label: String(u.unitNumber).padStart(2, '0') }))].map(({ id, label }) => {
                  const selected = selectedUnitId === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSelectedUnitId(id)}
                      title={id === 'all' ? 'Semua kata (130)' : LESSON_UNITS.find(u => u.id === id)?.title}
                      className={`px-3 py-1.5 tabular-nums border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion ${
                        selected ? 'bg-ink text-paper border-ink font-semibold' : 'border-transparent text-muted hover:text-ink hover:border-ink/30'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Search & status filters on compact / grid views */}
              {viewMode !== 'focus' && (
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kata di bab ini"
                    aria-label="Cari kata di bab ini"
                    className="flex-1 bg-transparent border-b border-ink pb-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
                  />
                  <div className="flex items-center gap-4 text-xs overflow-x-auto">
                    {(['all', 'mastered', 'learning', 'bookmarked'] as FilterStatusType[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        aria-pressed={statusFilter === st}
                        className={`whitespace-nowrap pb-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion ${
                          statusFilter === st ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
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
                  <p className="border-y border-ink/20 py-10 text-center text-sm text-muted">Tidak ada kata yang sesuai.</p>
                )}
              </div>
            )}

            {/* VIEW MODE 3: GRID (Kartu Lengkap) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in">
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
