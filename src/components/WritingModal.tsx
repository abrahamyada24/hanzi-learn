import React from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Volume2 } from 'lucide-react';
import type { VocabItem } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';

interface WritingModalProps {
  vocab: VocabItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onCharacterCompleted?: (char: string, mistakes: number) => void;
}

export const WritingModal: React.FC<WritingModalProps> = ({
  vocab,
  isOpen,
  onClose,
  onPrev,
  onNext,
  onCharacterCompleted
}) => {
  if (!isOpen || !vocab) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200/50 dark:border-red-900/50">
              Latihan Menulis
            </span>
            <span className="text-stone-500 dark:text-stone-400 text-xs font-mono">HSK 1</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Word Information Card */}
          <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{vocab.hanzi}</span>
                <span className="text-lg font-bold text-red-700 dark:text-red-400">{vocab.pinyin}</span>
                <button
                  onClick={() => speechManager.speak(vocab.hanzi)}
                  className="p-1 text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Dengarkan kata"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-stone-700 dark:text-stone-300 font-medium mt-1">
                {vocab.indonesian} <span className="text-stone-400 dark:text-stone-500 text-xs">({vocab.english})</span>
              </div>
            </div>
            <span className="text-xs bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-xl font-medium">
              {vocab.category}
            </span>
          </div>

          {/* Interactive Writing Canvas */}
          <div className="flex justify-center">
            <HanziWriterCanvas
              text={vocab.hanzi}
              pinyin={vocab.pinyin}
              meaning={vocab.indonesian}
              size={290}
              onCharacterComplete={onCharacterCompleted}
            />
          </div>

          {/* Example sentence hint */}
          {vocab.examples && vocab.examples[0] && (
            <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs space-y-1">
              <div className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Contoh Penggunaan:</span>
              </div>
              <div className="text-stone-900 dark:text-stone-100 font-medium text-sm pt-0.5">{vocab.examples[0].hanzi}</div>
              <div className="text-red-800 dark:text-red-400 font-normal">{vocab.examples[0].pinyin}</div>
              <div className="text-stone-500 dark:text-stone-400 italic">{vocab.examples[0].indonesian}</div>
            </div>
          )}
        </div>

        {/* Modal Footer: Prev / Next Navigation */}
        <div className="px-6 py-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-xs text-stone-400 dark:text-stone-500 font-medium hidden sm:inline">
            Tulis setiap goresan sesuai urutan
          </span>

          <button
            onClick={onNext}
            disabled={!onNext}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 disabled:opacity-30 transition-colors shadow-sm active:scale-95"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
