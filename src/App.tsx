import { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Search, 
  PenTool,
  Compass,
  LayoutGrid,
  List,
  Maximize2,
  Cloud,
  LogOut
} from 'lucide-react';
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
import { StatsHeader } from './components/StatsHeader';
import { VocabCard } from './components/VocabCard';
import { FocusFlashcardView } from './components/FocusFlashcardView';
import { CompactListView } from './components/CompactListView';
import { CharacterStoriesView } from './components/CharacterStoriesView';
import { WritingModal } from './components/WritingModal';
import { QuizMode } from './components/QuizMode';
import { RadicalsView } from './components/RadicalsView';
import { CustomCharacterSandbox } from './components/CustomCharacterSandbox';

type NavTab = 'flashcards' | 'stories' | 'quiz' | 'radicals' | 'sandbox';
type ViewMode = 'focus' | 'compact' | 'grid';
type FilterStatusType = 'all' | 'new' | 'learning' | 'mastered' | 'bookmarked';

export function App() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [activeTab, setActiveTab] = useState<NavTab>('flashcards');
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-1'); // Default Bab 1: 10 kata
  
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');

  // Modal for writing practice
  const [writingModalVocab, setWritingModalVocab] = useState<VocabItem | null>(null);

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

    if (user) {
      saveToCloud(user.uid, { bookmarks: updated });
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
    <div className="min-h-screen bg-stone-100/60 text-stone-900 pb-20 font-sans">
      {/* Top Navbar: Mobile-optimized sticky navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="h-16 flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-700 text-white font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md">
                汉
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">HanziLearn</span>
                <span className="hidden md:inline-block ml-2 text-[11px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  HSK 1 & Piktogram
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Scrollable on small mobile screens) */}
            <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl text-xs sm:text-sm font-medium text-stone-600 overflow-x-auto max-w-[calc(100vw-210px)] sm:max-w-none">
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'flashcards' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Kosakata</span>
              </button>

              <button
                onClick={() => setActiveTab('stories')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'stories' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Asal Huruf</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Kuis</span>
              </button>

              <button
                onClick={() => setActiveTab('radicals')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'radicals' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Radikal</span>
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'sandbox' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <PenTool className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="hidden sm:inline">Tulis Bebas</span>
              </button>
            </nav>

            {/* Right Side: Google Login / User Profile */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pl-2 bg-stone-100 hover:bg-stone-200 rounded-full transition border border-stone-200 active:scale-95"
                  >
                    <span className="text-xs font-semibold text-stone-700 hidden sm:inline max-w-[90px] truncate">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </span>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold text-xs flex items-center justify-center">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in">
                      <div className="pb-2.5 mb-2 border-b border-stone-100">
                        <div className="font-bold text-sm text-stone-900 truncate">{user.displayName || 'Pengguna'}</div>
                        <div className="text-xs text-stone-500 truncate">{user.email}</div>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Tersinkron ke Google Cloud</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => loginWithGoogle()}
                  className="flex items-center gap-2 py-1.5 px-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition shadow-xs active:scale-95"
                  title="Masuk dengan Google untuk sinkronkan hafalanmu di semua perangkat"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Masuk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-5 space-y-6">
        {/* Progress & Streak Stats Banner */}
        <StatsHeader
          stats={stats}
          totalWords={HSK1_VOCABULARY.length}
          masteredCount={masteredCount}
          learningCount={learningCount}
        />

        {/* TAB 1: KOSAKATA & FLASHCARD */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Bab / Unit Selector Pill Bar (Anti-Overload!) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
                <div>
                  <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                    Pilih Bab Belajar:
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5 mt-0.5">
                    <span>{currentUnit ? `${currentUnit.icon} ${currentUnit.title}` : 'Semua Bab (130 Kata)'}</span>
                    {currentUnit && (
                      <span className="text-xs font-normal text-stone-500">
                        &bull; {currentUnit.wordIds.length} kata
                      </span>
                    )}
                  </h3>
                </div>

                {/* View Mode Switcher: Fokus (1 Kartu) vs List Ringkas vs Grid */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setViewMode('focus')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'focus' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Mode fokus belajar 1 kartu per waktu"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Fokus 1 Kartu</span>
                  </button>

                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'compact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Tampilan daftar ringkas hemat ruang"
                  >
                    <List className="w-3.5 h-3.5 text-blue-600" />
                    <span>Daftar</span>
                  </button>

                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                      viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Tampilan grid kartu lengkap"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-stone-600" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>

              {/* Units horizontal scroll bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedUnitId('all')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition font-medium ${
                    selectedUnitId === 'all'
                      ? 'bg-stone-900 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-100">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata di bab ini..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-600/20"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto text-xs">
                    {(['all', 'mastered', 'learning', 'bookmarked'] as FilterStatusType[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1.5 rounded-xl border whitespace-nowrap text-xs transition ${
                          statusFilter === st
                            ? 'bg-stone-800 text-white border-stone-800 font-semibold'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
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
                  <div className="bg-white rounded-3xl p-8 text-center text-stone-400">
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

        {/* TAB 2: ASAL-USUL HURUF (PIKTOGRAM & CERITA ETİMOLOGI) */}
        {activeTab === 'stories' && (
          <div className="animate-in fade-in">
            <CharacterStoriesView />
          </div>
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

        {/* TAB 4: RADIKAL KANGXI */}
        {activeTab === 'radicals' && (
          <div className="animate-in fade-in">
            <RadicalsView />
          </div>
        )}

        {/* TAB 5: LATIHAN NULIS BEBAS (SANDBOX) */}
        {activeTab === 'sandbox' && (
          <div className="animate-in fade-in">
            <CustomCharacterSandbox />
          </div>
        )}
      </main>

      {/* Writing Practice Focused Modal */}
      <WritingModal
        vocab={writingModalVocab}
        isOpen={writingModalVocab !== null}
        onClose={() => setWritingModalVocab(null)}
        onPrev={handlePrevVocab}
        onNext={handleNextVocab}
        onCharacterCompleted={handleCharacterCompleted}
      />
    </div>
  );
}

export default App;
