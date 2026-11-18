import React from 'react';
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

  const figures = [
    { label: 'Streak', value: stats.streakDays, unit: 'hari' },
    { label: 'Ditulis', value: stats.charactersWritten, unit: 'karakter' },
    { label: 'Dikuasai', value: masteredCount, unit: `dari ${totalWords} kata` },
    { label: 'Progres', value: percentMastered, unit: '%' }
  ];

  return (
    <header className="pt-6">
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        <span>HSK 1 &mdash; Belajar Mandiri</span>
        <span>{totalWords} kata dasar</span>
      </div>

      <h1 className="mt-4 flex items-end gap-4 leading-none">
        <span className="font-serif font-black text-ink text-[5.5rem] sm:text-[8rem] tracking-tight">学汉字</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Kosakata, pelafalan, urutan goresan, dan kuis menulis aksara Hanzi.
      </p>

      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 border-t border-ink">
        {figures.map((f, i) => (
          <div
            key={f.label}
            className={`py-4 pr-4 ${i % 2 === 1 ? 'pl-4' : ''} ${i > 0 ? 'sm:pl-4' : ''} ${i % 2 === 1 ? 'border-l border-ink/20' : ''} ${i > 0 ? 'sm:border-l sm:border-ink/20' : ''} ${i >= 2 ? 'border-t border-ink/20 sm:border-t-0' : ''}`}
          >
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{f.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1.5">
              <span className="text-5xl sm:text-6xl font-semibold tracking-tighter text-ink leading-none">{f.value}</span>
              <span className="text-xs text-muted">{f.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-2">
        <div
          className="flex h-1.5 w-full bg-ink/10"
          role="img"
          aria-label={`${masteredCount} dikuasai, ${learningCount} sedang dipelajari, dari ${totalWords} kata`}
        >
          <div className="bg-ink h-full transition-all duration-500" style={{ width: `${(masteredCount / totalWords) * 100}%` }} />
          <div className="hatch h-full transition-all duration-500" style={{ width: `${(learningCount / totalWords) * 100}%` }} />
        </div>
        <div className="mt-2 flex gap-5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 bg-ink" />Dikuasai {masteredCount}</span>
          <span className="flex items-center gap-1.5"><span className="hatch inline-block h-2 w-4 border border-vermilion" />Dipelajari {learningCount}</span>
        </div>
      </div>
    </header>
  );
};
