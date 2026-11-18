import React, { useMemo } from 'react';
import { StatsHeader } from './StatsHeader';
import { LESSON_UNITS } from '../data/lessonUnits';
import { CHARACTER_STORIES } from '../data/characterStories';
import type { UserStats } from '../types';
import type { StorySubTab } from './StoriesAndRadicalsView';

interface HomeDashboardViewProps {
  stats: UserStats;
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  selectedUnitId: string;
  progress: Record<string, any>;
  onStartUnit: (unitId: string) => void;
  onNavigateTab: (tab: 'flashcards' | 'stories' | 'quiz' | 'profile', subTab?: StorySubTab) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const stripChapter = (title: string) => title.replace(/^Bab\s*\d+\s*:\s*/i, '');

const SectionLabel: React.FC<{ index: string; children: React.ReactNode; aside?: string }> = ({ index, children, aside }) => (
  <div className="flex items-baseline justify-between border-t-2 border-ink pt-3 text-[11px] font-medium uppercase tracking-[0.14em]">
    <span className="flex gap-3">
      <span className="text-vermilion">{index}</span>
      <span className="text-ink">{children}</span>
    </span>
    {aside && <span className="text-muted normal-case tracking-normal">{aside}</span>}
  </div>
);

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';

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
  const activeIndex = useMemo(() => {
    const i = LESSON_UNITS.findIndex(u => u.id === selectedUnitId);
    return i >= 0 ? i : 0;
  }, [selectedUnitId]);
  const activeUnit = LESSON_UNITS[activeIndex];

  const activeUnitProgress = useMemo(() => {
    const mastered = activeUnit.wordIds.filter(id => progress[id]?.status === 'mastered').length;
    const learning = activeUnit.wordIds.filter(id => progress[id]?.status === 'learning').length;
    const total = activeUnit.wordIds.length;
    return { mastered, learning, total };
  }, [activeUnit, progress]);

  // Hanzi of the Day (deterministic based on day of year)
  const dailyStory = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return { ...CHARACTER_STORIES[dayOfYear % CHARACTER_STORIES.length], dayOfYear };
  }, []);

  const guides = [
    { glyph: '笔', title: '7 Aturan Goresan Hanzi', desc: 'Urutan menulis (先横后竖, dll.) dan 8 goresan dasar dengan kanvas interaktif.', sub: 'stroke-order' as StorySubTab },
    { glyph: '调', title: '4 Nada Pinyin & Perubahan Nada', desc: 'Kontur 5 nada dan aturan 变调 (3+3, 不, 一) dengan audio.', sub: 'tones' as StorySubTab }
  ];

  const tools = [
    { glyph: '部', title: '16 Radikal Kunci', desc: 'Fondasi pembentuk aksara', go: () => onNavigateTab('stories', 'radicals') },
    { glyph: '测', title: 'Kuis Interaktif', desc: 'Tebak arti dan kuis tulis', go: () => onNavigateTab('quiz') },
    { glyph: '写', title: 'Kanvas Tulis Bebas', desc: 'Coba karakter apa saja', go: () => onNavigateTab('stories', 'sandbox') }
  ];

  return (
    <div className="space-y-14 pb-6">
      <StatsHeader
        stats={stats}
        totalWords={totalWords}
        masteredCount={masteredCount}
        learningCount={learningCount}
      />

      {/* 01 Lanjutkan */}
      <section className="space-y-5">
        <SectionLabel index="01">Lanjutkan belajar</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-start gap-5 min-w-0">
            <span className="text-7xl sm:text-8xl font-semibold tracking-tighter leading-[0.8] text-vermilion">
              {pad(activeIndex + 1)}
            </span>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">{stripChapter(activeUnit.title)}</h2>
              <p className="mt-1 text-sm text-muted">{activeUnit.subtitle}</p>
              <p className="mt-3 text-xs text-muted">
                <span className="text-ink font-semibold">{activeUnitProgress.mastered}</span> / {activeUnitProgress.total} kata dikuasai
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onStartUnit(activeUnit.id);
              onNavigateTab('flashcards');
            }}
            className={`bg-ink text-paper px-6 py-3.5 text-sm font-semibold tracking-wide hover:bg-vermilion transition-colors flex items-center justify-between gap-8 sm:min-w-52 ${focusRing}`}
          >
            <span>Mulai sekarang</span>
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      </section>

      {/* 02 Pedoman */}
      <section>
        <SectionLabel index="02" aside="Silabus HSK 3.0 (新版考试大纲)">Pedoman</SectionLabel>
        <ul>
          {guides.map(g => (
            <li key={g.sub} className="border-b border-ink/20">
              <button
                onClick={() => onNavigateTab('stories', g.sub)}
                className={`group w-full flex items-center gap-5 py-5 text-left ${focusRing}`}
              >
                <span className="font-serif font-black text-5xl w-14 text-center text-ink group-hover:text-vermilion transition-colors">{g.glyph}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-base font-semibold text-ink">{g.title}</span>
                  <span className="block mt-0.5 text-sm text-muted">{g.desc}</span>
                </span>
                <span aria-hidden className="text-ink group-hover:text-vermilion group-hover:translate-x-1 transition">&rarr;</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 03 Alat */}
      <section>
        <SectionLabel index="03">Latihan</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-ink/20 border-b border-ink/20">
          {tools.map((t, i) => (
            <button
              key={t.title}
              onClick={t.go}
              className={`group text-left py-5 sm:py-6 ${i > 0 ? 'border-t border-ink/20 sm:border-t-0 sm:pl-5' : ''} ${i < 2 ? 'sm:pr-5' : ''} ${focusRing}`}
            >
              <span className="font-serif font-black text-6xl leading-none text-ink group-hover:text-vermilion transition-colors">{t.glyph}</span>
              <span className="mt-4 block text-sm font-semibold text-ink">{t.title}</span>
              <span className="block text-xs text-muted mt-0.5">{t.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 04 Aksara hari ini */}
      {dailyStory && (
        <section>
          <SectionLabel index="04" aside={`Hari ke-${dailyStory.dayOfYear}`}>
            Aksara hari ini
          </SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-12 gap-y-4 pt-6 items-end">
            <div className="font-serif font-black text-ink leading-[0.85] text-[9rem] sm:text-[12rem]">{dailyStory.character}</div>
            <div className="pb-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-tight text-vermilion">{dailyStory.pinyin}</span>
                <span className="text-sm text-ink">{dailyStory.meaning}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-4 max-w-xl">{dailyStory.story}</p>
              <button
                onClick={() => onNavigateTab('stories', 'stories')}
                className={`mt-4 text-sm font-semibold text-ink underline underline-offset-4 decoration-1 hover:text-vermilion ${focusRing}`}
              >
                Baca cerita lengkap &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 05 Kurikulum */}
      <section>
        <SectionLabel index="05" aside={`${LESSON_UNITS.length} bab · ${totalWords} kata`}>Kurikulum</SectionLabel>
        <ol>
          {LESSON_UNITS.map((unit, i) => {
            const mastered = unit.wordIds.filter(id => progress[id]?.status === 'mastered').length;
            const learning = unit.wordIds.filter(id => progress[id]?.status === 'learning').length;
            const total = unit.wordIds.length;
            const done = total > 0 && mastered === total;
            const current = unit.id === selectedUnitId;

            return (
              <li key={unit.id} className="border-b border-ink/20">
                <button
                  onClick={() => {
                    onStartUnit(unit.id);
                    onNavigateTab('flashcards');
                  }}
                  aria-current={current ? 'true' : undefined}
                  className={`group relative w-full grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_9rem] items-center gap-3 py-4 text-left ${focusRing}`}
                >
                  {current && <span aria-hidden className="absolute -left-3 top-0 bottom-0 w-1 bg-vermilion" />}
                  <span className={`text-2xl font-semibold tracking-tighter ${current ? 'text-vermilion' : 'text-muted'}`}>{pad(i + 1)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm sm:text-base font-semibold text-ink group-hover:text-vermilion transition-colors">{stripChapter(unit.title)}</span>
                    <span className="block truncate text-xs text-muted mt-0.5">{unit.subtitle}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs font-semibold text-ink">
                      {done ? 'Khatam' : <>{mastered}<span className="text-muted font-normal"> / {total}</span></>}
                    </span>
                    <span className="mt-1.5 flex h-1 w-full bg-ink/10 ml-auto sm:w-full min-w-14">
                      <span className="bg-ink h-full" style={{ width: `${(mastered / total) * 100}%` }} />
                      <span className="hatch h-full" style={{ width: `${(learning / total) * 100}%` }} />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
};
