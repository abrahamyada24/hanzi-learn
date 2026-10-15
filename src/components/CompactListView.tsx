import React from 'react';
import { Volume2, PenTool, Star, Check, Clock } from 'lucide-react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';

interface CompactListViewProps {
  vocabList: VocabItem[];
  progress: Record<string, any>;
  bookmarks: string[];
  onStatusChange: (wordId: string, status: MasteryStatus) => void;
  onToggleBookmark: (wordId: string) => void;
  onOpenWritingPractice: (vocab: VocabItem) => void;
}

export const CompactListView: React.FC<CompactListViewProps> = ({
  vocabList,
  progress,
  bookmarks,
  onStatusChange,
  onToggleBookmark,
  onOpenWritingPractice
}) => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 transition-colors">
      {vocabList.map((item) => {
        const isBookmarked = bookmarks.includes(item.id);
        const status: MasteryStatus = progress[item.id]?.status || 'new';

        return (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition flex items-center justify-between gap-3 group"
          >
            {/* Left: Audio + Hanzi + Pinyin + Meaning */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => speechManager.speak(item.hanzi)}
                className="p-2 text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex-shrink-0"
                title="Dengar audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition">
                    {item.hanzi}
                  </span>
                  <span className="font-sans font-semibold text-xs text-red-700 dark:text-red-400">
                    {item.pinyin}
                  </span>
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400 truncate mt-0.5 max-w-[200px] sm:max-w-md">
                  {item.indonesian}
                </div>
              </div>
            </div>

            {/* Right Actions: Write button, Bookmark, Status toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onOpenWritingPractice(item)}
                className="p-2 sm:px-2.5 sm:py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/50 dark:border-red-900/50 text-xs font-medium flex items-center gap-1 transition"
                title="Latihan tulis"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tulis</span>
              </button>

              <button
                onClick={() => onToggleBookmark(item.id)}
                className={`p-2 rounded-xl transition ${
                  isBookmarked 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-300'
                }`}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>

              {/* Status Indicator cycle */}
              <button
                onClick={() => {
                  const nextStatus: MasteryStatus = 
                    status === 'new' ? 'learning' : status === 'learning' ? 'mastered' : 'new';
                  onStatusChange(item.id, nextStatus);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  status === 'mastered'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : status === 'learning'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
                }`}
                title="Klik untuk ubah status hafalan"
              >
                {status === 'mastered' && <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />}
                {status === 'learning' && <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                <span className="capitalize">{status === 'new' ? 'Baru' : status === 'learning' ? 'Belajar' : 'Hafal'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
