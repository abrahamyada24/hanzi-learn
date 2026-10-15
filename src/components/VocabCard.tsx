import React, { useState } from 'react';
import { Volume2, PenTool, Star, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';

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

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechManager.speak(vocab.hanzi);
  };

  const handleExampleAudio = (e: React.MouseEvent, sentence: string) => {
    e.stopPropagation();
    speechManager.speak(sentence);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Bar: Category badge & Bookmark */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
          {vocab.category}
        </span>
        <button
          onClick={onToggleBookmark}
          className={`p-1.5 rounded-lg transition-colors ${
            isBookmarked 
              ? 'text-amber-500 fill-amber-500' 
              : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-300'
          }`}
          title={isBookmarked ? 'Hapus dari favorit' : 'Simpan ke favorit'}
        >
          <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-5 py-2">
        <div className="flex items-center justify-between mb-1">
          {/* Main Hanzi Character */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-wider font-serif">
              {vocab.hanzi}
            </span>
            <button
              onClick={handleAudio}
              className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
              title="Dengarkan pelafalan kata"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Write Practice Action */}
          <button
            onClick={() => onOpenWritingPractice(vocab)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-200 transition-colors border border-red-200/60 dark:border-red-900/50"
            title="Buka kanvas latihan nulis goresan Hanzi"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tulis</span>
          </button>
        </div>

        {/* Pinyin */}
        <div className="text-red-700 dark:text-red-400 font-semibold text-base mb-1 tracking-wide">
          {vocab.pinyin}
        </div>

        {/* Indonesian & English Translation */}
        <div className="text-stone-800 dark:text-stone-200 font-medium text-sm">
          {vocab.indonesian}
        </div>
        <div className="text-stone-400 dark:text-stone-500 text-xs mt-0.5">
          {vocab.english}
        </div>

        {/* Example Sentence Collapsible */}
        {vocab.examples && vocab.examples.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center justify-between w-full text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 py-1"
            >
              <span>Contoh Kalimat ({vocab.examples.length})</span>
              {showExamples ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExamples && (
              <div className="mt-2 space-y-2 text-xs bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-700 animate-in fade-in">
                {vocab.examples.map((ex, idx) => (
                  <div key={idx} className="group/ex">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{ex.hanzi}</div>
                      <button
                        onClick={(e) => handleExampleAudio(e, ex.hanzi)}
                        className="text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-0.5"
                        title="Dengar audio contoh kalimat"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-red-800 dark:text-red-400 font-normal text-[11px]">{ex.pinyin}</div>
                    <div className="text-stone-600 dark:text-stone-400 italic text-[11px]">{ex.indonesian}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Buttons (SRS Quick Tagging) */}
      <div className="p-3 bg-stone-50/70 dark:bg-stone-950/80 border-t border-stone-100 dark:border-stone-800 mt-2 flex items-center justify-between text-xs transition-colors">
        <span className="text-stone-400 dark:text-stone-500 text-[11px]">Hafalan:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStatusChange('new')}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              status === 'new'
                ? 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-100 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            Baru
          </button>
          <button
            onClick={() => onStatusChange('learning')}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              status === 'learning'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800'
                : 'text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Clock className="w-3 h-3" />
            Belajar
          </button>
          <button
            onClick={() => onStatusChange('mastered')}
            className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              status === 'mastered'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800'
                : 'text-stone-500 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Check className="w-3 h-3" />
            Hafal
          </button>
        </div>
      </div>
    </div>
  );
};
