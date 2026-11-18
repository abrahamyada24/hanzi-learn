import React from 'react';
import type { VocabItem } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { Dialog } from './ui/Dialog';
import { AudioButton } from './ui/marks';

interface WritingModalProps {
  vocab: VocabItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onCharacterCompleted?: (char: string, mistakes: number) => void;
}

export const WritingModal: React.FC<WritingModalProps> = ({ vocab, isOpen, onClose, onPrev, onNext, onCharacterCompleted }) => {
  if (!isOpen || !vocab) return null;

  const example = vocab.examples?.[0];

  return (
    <Dialog
      eyebrow="Latihan menulis · HSK 1"
      size="lg"
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 divide-x divide-ink">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="px-5 py-3.5 text-sm font-semibold text-ink flex justify-between hover:bg-paper-2 disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion"
          >
            <span aria-hidden>&larr;</span>
            <span>Sebelumnya</span>
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="px-5 py-3.5 text-sm font-semibold bg-ink text-paper flex justify-between hover:bg-vermilion disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion"
          >
            <span>Selanjutnya</span>
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      }
    >
      <div className="p-5 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-end gap-4">
              <span className="font-serif font-black text-6xl leading-none text-ink">{vocab.hanzi}</span>
              <div className="pb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold tracking-tight text-vermilion">{vocab.pinyin}</span>
                  <AudioButton onClick={() => speechManager.speak(vocab.hanzi)} label="Dengarkan kata" iconClass="w-4 h-4" />
                </div>
                <div className="text-sm text-ink">
                  {vocab.indonesian} <span className="text-xs text-muted">({vocab.english})</span>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted text-right">{vocab.category}</span>
        </div>

        <div className="flex justify-center">
          <HanziWriterCanvas
            text={vocab.hanzi}
            pinyin={vocab.pinyin}
            meaning={vocab.indonesian}
            size={290}
            onCharacterComplete={onCharacterCompleted}
          />
        </div>

        {example && (
          <div className="border-t border-ink pt-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Contoh penggunaan</div>
            <div className="mt-2 font-serif font-bold text-xl text-ink">{example.hanzi}</div>
            <div className="text-sm text-vermilion">{example.pinyin}</div>
            <div className="text-sm text-muted">{example.indonesian}</div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
