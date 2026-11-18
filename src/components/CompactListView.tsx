import React from 'react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';
import { AudioButton, BookmarkIcon, StatusSwatch, STATUS_LABEL, focusRing } from './ui/marks';

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
}) => (
  <ul className="border-t border-ink">
    {vocabList.map((item, i) => {
      const isBookmarked = bookmarks.includes(item.id);
      const status: MasteryStatus = progress[item.id]?.status || 'new';
      const next: MasteryStatus = status === 'new' ? 'learning' : status === 'learning' ? 'mastered' : 'new';

      return (
        <li key={item.id} className="group border-b border-ink/20 py-3 grid grid-cols-[1.5rem_1fr_auto] sm:grid-cols-[2rem_1fr_auto] items-center gap-3">
          <span className="text-xs tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>

          <div className="min-w-0 flex items-center gap-4">
            <span className="font-serif font-black text-2xl sm:text-3xl leading-none text-ink whitespace-nowrap min-w-[4.5rem] sm:min-w-[6.5rem] flex-shrink-0 group-hover:text-vermilion transition-colors">
              {item.hanzi}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-vermilion">{item.pinyin}</div>
              <div className="text-xs text-muted truncate">{item.indonesian}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <AudioButton onClick={() => speechManager.speak(item.hanzi)} label="Dengar audio" iconClass="w-4 h-4" />
            <button
              onClick={() => onOpenWritingPractice(item)}
              className={`hidden sm:inline font-semibold text-ink underline underline-offset-4 decoration-1 hover:text-vermilion ${focusRing}`}
              title="Latihan tulis"
            >
              Tulis
            </button>
            <button
              onClick={() => onToggleBookmark(item.id)}
              aria-pressed={isBookmarked}
              aria-label="Tandai favorit"
              className={`text-muted hover:text-ink ${focusRing}`}
            >
              <BookmarkIcon active={isBookmarked} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(item.id, next)}
              title="Klik untuk ubah status hafalan"
              className={`flex items-center gap-1.5 w-[4.75rem] justify-start text-ink ${status === 'new' ? 'text-muted' : 'font-semibold'} ${focusRing}`}
            >
              <StatusSwatch status={status} />
              <span>{STATUS_LABEL[status]}</span>
            </button>
          </div>
        </li>
      );
    })}
  </ul>
);
