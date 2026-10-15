import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  PenTool, 
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { StatsHeader } from './StatsHeader';
import { LESSON_UNITS } from '../data/lessonUnits';
import { CHARACTER_STORIES } from '../data/characterStories';
import type { UserStats } from '../types';

interface HomeDashboardViewProps {
  stats: UserStats;
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  selectedUnitId: string;
  progress: Record<string, any>;
  onStartUnit: (unitId: string) => void;
  onNavigateTab: (tab: 'flashcards' | 'stories' | 'quiz' | 'profile', subTab?: 'stories' | 'radicals' | 'sandbox') => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  stats,
  totalWords,
  masteredCount,
  learningCount,
  selectedUnitId,
  progress,
  onStartUnit,
  onNavigateTab
}) => {
  // Current active unit for quick resume
  const activeUnit = useMemo(() => {
    const found = LESSON_UNITS.find(u => u.id === selectedUnitId);
    return found || LESSON_UNITS[0];
  }, [selectedUnitId]);

  // Compute progress for the active unit
  const activeUnitProgress = useMemo(() => {
    const mastered = activeUnit.wordIds.filter(id => progress[id]?.status === 'mastered').length;
    const learning = activeUnit.wordIds.filter(id => progress[id]?.status === 'learning').length;
    const total = activeUnit.wordIds.length;
    const percent = Math.round((mastered / total) * 100);
    return { mastered, learning, total, percent };
  }, [activeUnit, progress]);

  // Hanzi of the Day (deterministic based on day of year)
  const dailyStory = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return CHARACTER_STORIES[dayOfYear % CHARACTER_STORIES.length];
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in pb-4">
      {/* 1. STATS BANNER UTAMA (Desain Asli Favorit Pengguna) */}
      <StatsHeader
        stats={stats}
        totalWords={totalWords}
        masteredCount={masteredCount}
        learningCount={learningCount}
      />

      {/* 2. KARTU "LANJUTKAN BELAJAR" (QUICK RESUME) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-stone-800 text-2xl flex items-center justify-center flex-shrink-0 shadow-xs border border-red-100 dark:border-stone-700">
              {activeUnit.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200/50 dark:border-red-900/40">
                  Lanjutkan Belajar
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {activeUnitProgress.mastered} dari {activeUnitProgress.total} kata hafal
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1 truncate">
                {activeUnit.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                {activeUnit.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onStartUnit(activeUnit.id);
              onNavigateTab('flashcards');
            }}
            className="w-full sm:w-auto py-3 px-6 bg-red-700 hover:bg-red-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 active:scale-98 flex-shrink-0"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar inside resume card */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full mt-4 overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${activeUnitProgress.percent}%` }}
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${(activeUnitProgress.learning / activeUnitProgress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. PINTASAN FITUR UTAMA (3 KOLOM) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Radikal Dasar */}
        <button
          onClick={() => onNavigateTab('stories', 'radicals')}
          className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs text-left transition flex items-center gap-3.5 group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition border border-blue-100 dark:border-blue-900/40">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              16 Radikal Kunci
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              Fondasi pembentuk aksara
            </div>
          </div>
        </button>

        {/* Kuis Interaktif */}
        <button
          onClick={() => onNavigateTab('quiz')}
          className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs text-left transition flex items-center gap-3.5 group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition border border-emerald-100 dark:border-emerald-900/40">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              Kuis Interaktif
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              Tebak arti & kuis tulis
            </div>
          </div>
        </button>

        {/* Tulis Bebas (Sandbox) */}
        <button
          onClick={() => onNavigateTab('stories', 'sandbox')}
          className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs text-left transition flex items-center gap-3.5 group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition border border-purple-100 dark:border-purple-900/40">
            <PenTool className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
              Kanvas Tulis Bebas
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              Coba karakter apa saja
            </div>
          </div>
        </button>
      </div>

      {/* 4. AKSARA HARI INI (HANZI OF THE DAY) */}
      {dailyStory && (
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-900 rounded-3xl p-5 sm:p-6 border border-amber-200/70 dark:border-stone-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Big Hanzi Character */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-serif font-bold text-4xl sm:text-5xl flex items-center justify-center shadow-sm border border-amber-200/80 dark:border-stone-700 flex-shrink-0">
                {dailyStory.character}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aksara & Piktogram Hari Ini</span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm sm:text-base font-bold text-red-700 dark:text-red-400">{dailyStory.pinyin}</span>
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">&bull; {dailyStory.meaning}</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed line-clamp-2 max-w-xl">
                  {dailyStory.story}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('stories', 'stories')}
              className="py-2 px-4 bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-amber-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 self-start sm:self-center active:scale-95 whitespace-nowrap shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Buka Cerita Lengkap</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. PETA 10 BAB HSK 1 (LEARNING ROADMAP) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Kurikulum Pembelajaran
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            Peta 10 Bab HSK 1 (130 Kata Dasar)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Pilih salah satu bab untuk mulai latihan kosakata dan urutan goresan menulisnya:
          </p>
        </div>

        {/* 10 Bab Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {LESSON_UNITS.map((unit) => {
            const masteredInUnit = unit.wordIds.filter(id => progress[id]?.status === 'mastered').length;
            const learningInUnit = unit.wordIds.filter(id => progress[id]?.status === 'learning').length;
            const totalInUnit = unit.wordIds.length;
            const isCompleted = masteredInUnit === totalInUnit && totalInUnit > 0;
            const isCurrent = unit.id === selectedUnitId;

            return (
              <button
                key={unit.id}
                onClick={() => {
                  onStartUnit(unit.id);
                  onNavigateTab('flashcards');
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-center justify-between gap-3 group active:scale-[0.99] ${
                  isCurrent 
                    ? 'border-red-300 dark:border-red-900/80 bg-red-50/40 dark:bg-red-950/30 shadow-xs ring-1 ring-red-200 dark:ring-red-900/50' 
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 text-xl flex items-center justify-center flex-shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition">
                    {unit.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-red-700 dark:group-hover:text-red-400 transition">
                      {unit.title}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      {unit.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Khatam</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        {masteredInUnit}/{totalInUnit} <span className="text-[9px] font-normal text-stone-400">kata</span>
                      </div>
                      <div className="w-14 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-1 overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${(masteredInUnit / totalInUnit) * 100}%` }}
                        />
                        <div 
                          className="bg-amber-400 h-full" 
                          style={{ width: `${(learningInUnit / totalInUnit) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
