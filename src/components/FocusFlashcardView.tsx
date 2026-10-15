import { useState, useEffect } from 'react';
import { 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  PenTool, 
  Eye, 
  Check, 
  Clock
} from 'lucide-react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';
import { HanziWriterCanvas } from './HanziWriterCanvas';

interface FocusFlashcardViewProps {
  vocabList: VocabItem[];
  progress: Record<string, any>;
  bookmarks: string[];
  onStatusChange: (wordId: string, status: MasteryStatus) => void;
  onToggleBookmark: (wordId: string) => void;
  onCharacterCompleted?: (char: string, mistakes: number) => void;
  activeWordId?: string;
}

export const FocusFlashcardView: React.FC<FocusFlashcardViewProps> = ({
  vocabList,
  progress,
  bookmarks,
  onStatusChange,
  onToggleBookmark,
  onCharacterCompleted,
  activeWordId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showWritingCanvas, setShowWritingCanvas] = useState(false);

  // Jump to specific word if provided by search / selection
  useEffect(() => {
    if (activeWordId) {
      const idx = vocabList.findIndex(v => v.id === activeWordId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsRevealed(false);
        setShowWritingCanvas(false);
      }
    }
  }, [activeWordId, vocabList]);

  if (!vocabList || vocabList.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 text-center border border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500">
        <p>Tidak ada kata dalam bab ini.</p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, vocabList.length - 1);
  const currentWord = vocabList[safeIndex];
  const isBookmarked = bookmarks.includes(currentWord.id);
  const currentStatus: MasteryStatus = progress[currentWord.id]?.status || 'new';

  const handleNext = () => {
    if (safeIndex < vocabList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setShowWritingCanvas(false);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsRevealed(false);
      setShowWritingCanvas(false);
    }
  };

  const handleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    speechManager.speak(currentWord.hanzi);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 animate-in fade-in">
      {/* Top Header & Counter Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
        <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full border border-red-200/60 dark:border-red-900/50">
          {currentWord.category}
        </span>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-stone-900 dark:text-stone-100 font-bold text-sm">{safeIndex + 1}</span>
          <span className="text-stone-400 dark:text-stone-500">/</span>
          <span>{vocabList.length}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-red-700 dark:bg-red-600 h-full transition-all duration-300"
          style={{ width: `${((safeIndex + 1) / vocabList.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Body */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden relative transition-colors">
        {/* Card Top Actions: Bookmark */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            {currentStatus === 'mastered' ? '🏆 Sudah Hafal' : currentStatus === 'learning' ? '⏳ Sedang Dipelajari' : '🌱 Kata Baru'}
          </div>
          <button
            onClick={() => onToggleBookmark(currentWord.id)}
            className={`p-2 rounded-xl transition ${
              isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
            title="Tandai favorit"
          >
            <Star className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Central Character & Pronunciation */}
        <div className="p-6 pt-2 pb-4 text-center">
          <div className="relative inline-block my-2">
            <h2 className="text-6xl sm:text-7xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-wider">
              {currentWord.hanzi}
            </h2>
            <button
              onClick={() => handleAudio()}
              className="absolute -right-10 top-1/2 -translate-y-1/2 p-2.5 bg-red-50 dark:bg-stone-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-stone-750 rounded-full transition shadow-xs active:scale-95 border border-red-100 dark:border-stone-700"
              title="Dengarkan pelafalan"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Reveal Button or Meaning Content */}
          {!isRevealed ? (
            <div className="mt-4">
              <button
                onClick={() => {
                  setIsRevealed(true);
                  handleAudio();
                }}
                className="w-full py-3.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2 border border-stone-200/80 dark:border-stone-700 active:scale-98"
              >
                <Eye className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span>Buka Arti & Pinyin</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 animate-in fade-in">
              <div className="text-xl font-bold text-red-700 dark:text-red-400 tracking-wide">
                {currentWord.pinyin}
              </div>
              <div className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {currentWord.indonesian}
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-500">
                {currentWord.english}
              </div>

              {/* Example sentence */}
              {currentWord.examples && currentWord.examples[0] && (
                <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-700/80 text-left text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 text-[10px] uppercase font-bold">
                    <span>Contoh Kalimat</span>
                    <button
                      onClick={() => speechManager.speak(currentWord.examples[0].hanzi)}
                      className="text-stone-400 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{currentWord.examples[0].hanzi}</div>
                  <div className="text-red-800 dark:text-red-400">{currentWord.examples[0].pinyin}</div>
                  <div className="text-stone-600 dark:text-stone-300 italic">{currentWord.examples[0].indonesian}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inline Writing Canvas Toggle */}
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowWritingCanvas(!showWritingCanvas)}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              showWritingCanvas
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/60 dark:border-red-900/50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{showWritingCanvas ? 'Tutup Kanvas Tulis' : 'Latihan Tulis Karakter Ini'}</span>
          </button>

          {showWritingCanvas && (
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-center animate-in fade-in">
              <HanziWriterCanvas
                text={currentWord.hanzi}
                pinyin={currentWord.pinyin}
                meaning={currentWord.indonesian}
                size={260}
                onCharacterComplete={onCharacterCompleted}
              />
            </div>
          )}
        </div>

        {/* Bottom SRS Quick Tagging */}
        <div className="bg-stone-50 dark:bg-stone-850 p-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs transition-colors">
          <button
            onClick={() => onStatusChange(currentWord.id, 'new')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition ${
              currentStatus === 'new' ? 'bg-stone-300 dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            Ulangi
          </button>
          <button
            onClick={() => onStatusChange(currentWord.id, 'learning')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
              currentStatus === 'learning' ? 'bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-300 font-bold' : 'text-stone-500 dark:text-stone-400 hover:bg-amber-100 dark:hover:bg-amber-950/40'
            }`}
          >
            <Clock className="w-3 h-3" /> Belajar
          </button>
          <button
            onClick={() => onStatusChange(currentWord.id, 'mastered')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
              currentStatus === 'mastered' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Check className="w-3 h-3" /> Hafal
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={safeIndex === 0}
          className="flex-1 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl font-semibold text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center gap-1 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <div className="w-3" />

        <button
          onClick={handleNext}
          disabled={safeIndex === vocabList.length - 1}
          className="flex-1 py-3 bg-red-700 text-white rounded-2xl font-semibold text-sm hover:bg-red-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center gap-1 shadow-sm"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
