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
    <div className="bg-gradient-to-r from-red-900 via-stone-900 to-red-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Traditional Chinese character background */}
      <div className="absolute right-4 -bottom-6 text-9xl font-serif text-white/5 select-none pointer-events-none">
        漢
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-500/20 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-red-500/30">
              Belajar Mandiri HSK 1
            </span>
            <span className="text-xs text-stone-300">Target 150 Kata Dasar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Mandarin Master &middot; <span className="font-serif font-normal text-red-300">学汉字</span>
          </h1>
          <p className="text-stone-300 text-sm mt-1 max-w-xl">
            Latihan kosakata, pelafalan audio, urutan goresan, dan kuis menulis aksara Hanzi interaktif.
          </p>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Streak */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs text-stone-300 font-medium">Streak</div>
              <div className="text-lg font-bold text-white">{stats.streakDays} Hari</div>
            </div>
          </div>

          {/* Characters Written */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-300 font-medium">Ditulis</div>
              <div className="text-lg font-bold text-white">{stats.charactersWritten} Karakter</div>
            </div>
          </div>

          {/* Mastered Words */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-300 font-medium">Dikuasai</div>
              <div className="text-lg font-bold text-white">{masteredCount} Kata</div>
            </div>
          </div>

          {/* Progress % */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-300 font-medium">Progres</div>
              <div className="text-lg font-bold text-white">{percentMastered}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/15 h-2 rounded-full mt-5 overflow-hidden flex">
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
