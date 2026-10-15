import { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Search, 
  Star, 
  Filter, 
  PenTool
} from 'lucide-react';
import { HSK1_VOCABULARY } from './data/hsk1';
import type { VocabItem, WordCategory, MasteryStatus, UserStats } from './types';
import { 
  getAllProgress, 
  saveWordProgress, 
  getUserStats, 
  recordActivity, 
  getBookmarks, 
  toggleBookmark 
} from './utils/storage';
import { StatsHeader } from './components/StatsHeader';
import { VocabCard } from './components/VocabCard';
import { WritingModal } from './components/WritingModal';
import { QuizMode } from './components/QuizMode';
import { RadicalsView } from './components/RadicalsView';
import { CustomCharacterSandbox } from './components/CustomCharacterSandbox';

type NavTab = 'flashcards' | 'quiz' | 'radicals' | 'sandbox';
type FilterStatusType = 'all' | 'new' | 'learning' | 'mastered' | 'bookmarked';

const CATEGORIES: WordCategory[] = [
  'Semua',
  'Salam & Dasar',
  'Kata Ganti & Tata Bahasa',
  'Angka & Waktu',
  'Orang & Keluarga',
  'Makanan & Minuman',
  'Kata Kerja & Aktivitas',
  'Benda & Sehari-hari',
  'Tempat & Arah',
  'Kata Sifat & Deskripsi'
];

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('flashcards');
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('Semua');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');

  // Modal for writing practice
  const [writingModalVocab, setWritingModalVocab] = useState<VocabItem | null>(null);

  // Load progress and stats on mount
  useEffect(() => {
    setProgress(getAllProgress());
    setStats(getUserStats());
    setBookmarks(getBookmarks());
  }, []);

  // Update word mastery status
  const handleStatusChange = (wordId: string, status: MasteryStatus) => {
    const updated = saveWordProgress(wordId, status);
    setProgress(prev => ({ ...prev, [wordId]: updated }));
  };

  // Toggle bookmark star
  const handleToggleBookmark = (wordId: string) => {
    const updated = toggleBookmark(wordId);
    setBookmarks(updated);
  };

  // Called when writing canvas finishes a character
  const handleCharacterCompleted = (_char: string, mistakes: number) => {
    const newStats = recordActivity(1, 0, 0);
    setStats(newStats);

    if (writingModalVocab) {
      const currentStatus = progress[writingModalVocab.id]?.status || 'learning';
      const updated = saveWordProgress(
        writingModalVocab.id, 
        currentStatus === 'new' ? 'learning' : currentStatus, 
        1, 
        mistakes
      );
      setProgress(prev => ({ ...prev, [writingModalVocab.id]: updated }));
    }
  };

  // Quiz finish handler
  const handleFinishQuiz = (correctCount: number, totalQuestions: number) => {
    const newStats = recordActivity(0, correctCount, totalQuestions);
    setStats(newStats);
  };

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    return HSK1_VOCABULARY.filter(item => {
      // Category match
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
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
  }, [selectedCategory, statusFilter, searchQuery, progress, bookmarks]);

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

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 pb-16 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md">
              汉
            </div>
            <div>
              <span className="font-bold text-lg text-stone-900 tracking-tight">HanziLearn</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                HSK 1 & Menulis
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl text-xs sm:text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'flashcards' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-red-600" />
              <span>Kosakata</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Kuis</span>
            </button>

            <button
              onClick={() => setActiveTab('radicals')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'radicals' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Radikal</span>
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'sandbox' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-600" />
              <span>Tulis Bebas</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero & Progress Stats Banner */}
        <StatsHeader
          stats={stats}
          totalWords={HSK1_VOCABULARY.length}
          masteredCount={masteredCount}
          learningCount={learningCount}
        />

        {/* TAB 1: KOSAKATA & FLASHCARD */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari karakter (你), pinyin (ni hao), atau arti (halo)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 p-1"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                      statusFilter === 'all'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Semua ({HSK1_VOCABULARY.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter('mastered')}
                    className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                      statusFilter === 'mastered'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-emerald-800 border-stone-200 hover:bg-emerald-50'
                    }`}
                  >
                    Hafal ({masteredCount})
                  </button>

                  <button
                    onClick={() => setStatusFilter('learning')}
                    className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                      statusFilter === 'learning'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-amber-800 border-stone-200 hover:bg-amber-50'
                    }`}
                  >
                    Belajar ({learningCount})
                  </button>

                  <button
                    onClick={() => setStatusFilter('bookmarked')}
                    className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all flex items-center gap-1 ${
                      statusFilter === 'bookmarked'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-amber-50'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${statusFilter === 'bookmarked' ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
                    Favorit ({bookmarks.length})
                  </button>
                </div>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-medium flex items-center gap-1 pr-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Kategori:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                      selectedCategory === cat
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Vocab Cards Grid */}
            {filteredVocab.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-stone-500" />
                <h4 className="text-base font-semibold text-stone-700">Tidak ada kata yang cocok</h4>
                <p className="text-xs text-stone-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); setStatusFilter('all'); }}
                  className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-200 transition"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KUIS INTERAKTIF */}
        {activeTab === 'quiz' && (
          <div className="animate-in fade-in">
            <QuizMode
              vocabList={HSK1_VOCABULARY}
              onFinishQuiz={handleFinishQuiz}
              onExit={() => setActiveTab('flashcards')}
            />
          </div>
        )}

        {/* TAB 3: RADIKAL KANGXI */}
        {activeTab === 'radicals' && (
          <div className="animate-in fade-in">
            <RadicalsView />
          </div>
        )}

        {/* TAB 4: LATIHAN NULIS BEBAS (SANDBOX) */}
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
