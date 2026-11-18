import React, { useState } from 'react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';
import { AudioButton, BookmarkIcon, StatusSwitch } from './ui/marks';
import { focusRing } from './ui/tokens';

interface VocabCardProps {
  vocab: VocabItem;
  status: MasteryStatus;
  isBookmarked: boolean;
  onStatusChange: (status: MasteryStatus) => void;
  onToggleBookmark: () => void;
  onOpenWritingPractice: (vocab: VocabItem) => void;
}

export const VocabCard: React.FC<VocabCardProps> = ({
  vocab,
  status,
  isBookmarked,
  onStatusChange,
  onToggleBookmark,
  onOpenWritingPractice
}) => {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <article className="border border-ink flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/20 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        <span>{vocab.category}</span>
        <button
          onClick={onToggleBookmark}
          aria-pressed={isBookmarked}
          className={`text-muted hover:text-ink transition-colors ${focusRing}`}
          title={isBookmarked ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          aria-label={isBookmarked ? 'Hapus dari favorit' : 'Simpan ke favorit'}
        >
          <BookmarkIcon active={isBookmarked} className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-4 flex-1">
        <div className="flex items-end justify-between gap-3">
          <span className="font-serif font-black text-6xl leading-none text-ink">{vocab.hanzi}</span>
          <AudioButton onClick={() => speechManager.speak(vocab.hanzi)} label="Dengarkan pelafalan kata" className="pb-1" />
        </div>

        <div className="mt-4 text-xl font-semibold tracking-tight text-vermilion">{vocab.pinyin}</div>
        <div className="text-sm font-medium text-ink">{vocab.indonesian}</div>
        <div className="text-xs text-muted">{vocab.english}</div>

        <button
          onClick={() => onOpenWritingPractice(vocab)}
          className={`mt-4 text-xs font-semibold text-ink underline underline-offset-4 decoration-1 hover:text-vermilion ${focusRing}`}
          title="Buka kanvas latihan menulis goresan Hanzi"
        >
          Latihan tulis &rarr;
        </button>

        {vocab.examples && vocab.examples.length > 0 && (
          <div className="mt-4 border-t border-ink/20 pt-2">
            <button
              onClick={() => setShowExamples(!showExamples)}
              aria-expanded={showExamples}
              className={`w-full flex items-center justify-between py-1 text-xs text-muted hover:text-ink ${focusRing}`}
            >
              <span>Contoh kalimat ({vocab.examples.length})</span>
              <span aria-hidden>{showExamples ? '−' : '+'}</span>
            </button>
            {showExamples && (
              <ul className="mt-2 space-y-3 animate-in fade-in">
                {vocab.examples.map((ex, idx) => (
                  <li key={idx}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif font-bold text-base text-ink">{ex.hanzi}</span>
                      <AudioButton
                        onClick={e => {
                          e.stopPropagation();
                          speechManager.speak(ex.hanzi);
                        }}
                        label="Dengar contoh kalimat"
                        iconClass="w-4 h-4"
                        className="text-muted"
                      />
                    </div>
                    <div className="text-xs text-vermilion">{ex.pinyin}</div>
                    <div className="text-xs text-muted">{ex.indonesian}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <StatusSwitch status={status} onChange={onStatusChange} className="!border-0 !border-t !border-ink" />
    </article>
  );
};
