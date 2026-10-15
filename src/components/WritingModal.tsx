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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-50 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-lg">
              Latihan Menulis
            </span>
            <span className="text-stone-500 text-xs">HSK 1</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Word Information Card */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-stone-900">{vocab.hanzi}</span>
                <span className="text-lg font-bold text-red-700">{vocab.pinyin}</span>
                <button
                  onClick={() => speechManager.speak(vocab.hanzi)}
                  className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Dengarkan kata"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-stone-700 font-medium mt-1">
                {vocab.indonesian} <span className="text-stone-400 text-xs">({vocab.english})</span>
              </div>
            </div>
            <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-xl font-medium">
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
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs space-y-1">
              <div className="font-semibold text-stone-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>Contoh Penggunaan:</span>
              </div>
              <div className="text-stone-900 font-medium text-sm pt-0.5">{vocab.examples[0].hanzi}</div>
              <div className="text-red-800 font-normal">{vocab.examples[0].pinyin}</div>
              <div className="text-stone-500 italic">{vocab.examples[0].indonesian}</div>
            </div>
          )}
        </div>

        {/* Modal Footer: Prev / Next Navigation */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-xs text-stone-400 font-medium">
            Tulis setiap goresan sesuai urutan
          </span>

          <button
            onClick={onNext}
            disabled={!onNext}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 disabled:opacity-40 transition-colors shadow-sm"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
