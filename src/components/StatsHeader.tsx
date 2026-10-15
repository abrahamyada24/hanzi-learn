import React from 'react';
import { Flame, CheckCircle, PenTool, BookOpen } from 'lucide-react';
import type { UserStats } from '../types';

interface StatsHeaderProps {
  stats: UserStats;
  totalWords: number;
  masteredCount: number;
  learningCount: number;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  stats,
  totalWords,
  masteredCount,
  learningCount
}) => {
  const percentMastered = Math.round((masteredCount / totalWords) * 100) || 0;

  return (
    <div className="bg-gradient-to-r from-red-950 via-stone-900 to-stone-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden">
      {/* Decorative Traditional Chinese character background */}
      <div className="absolute right-2 -bottom-4 text-7xl sm:text-9xl font-serif text-white/5 select-none pointer-events-none">
        漢
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-500/20 text-red-300 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-semibold border border-red-500/30">
              Belajar Mandiri HSK 1
            </span>
            <span className="text-[11px] sm:text-xs text-stone-300">10 Bab Terstruktur</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
            Mandarin Master &middot; <span className="font-serif font-normal text-red-300">学汉字</span>
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-none">
            Latihan kosakata, pelafalan audio, urutan goresan, dan kuis menulis aksara Hanzi interaktif.
          </p>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {/* Streak */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs text-stone-300 font-medium">Streak</div>
              <div className="text-xs sm:text-base font-bold text-white leading-tight">{stats.streakDays}d</div>
            </div>
          </div>

          {/* Characters Written */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs text-stone-300 font-medium">Ditulis</div>
              <div className="text-xs sm:text-base font-bold text-white leading-tight">{stats.charactersWritten}</div>
            </div>
          </div>

          {/* Mastered Words */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs text-stone-300 font-medium">Hafal</div>
              <div className="text-xs sm:text-base font-bold text-white leading-tight">{masteredCount}</div>
            </div>
          </div>

          {/* Progress % */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs text-stone-300 font-medium">Progres</div>
              <div className="text-xs sm:text-base font-bold text-white leading-tight">{percentMastered}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/15 h-1.5 rounded-full mt-3 sm:mt-4 overflow-hidden flex">
        <div 
          className="bg-emerald-500 h-full transition-all duration-500"
          style={{ width: `${(masteredCount / totalWords) * 100}%` }}
          title={`Dikuasai: ${masteredCount}`}
        />
        <div 
          className="bg-amber-400 h-full transition-all duration-500"
          style={{ width: `${(learningCount / totalWords) * 100}%` }}
          title={`Sedang Belajar: ${learningCount}`}
        />
      </div>
    </div>
  );
};
