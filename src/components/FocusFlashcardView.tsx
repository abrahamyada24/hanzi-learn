import { useState } from 'react';
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
}

export const FocusFlashcardView: React.FC<FocusFlashcardViewProps> = ({
  vocabList,
  progress,
  bookmarks,
  onStatusChange,
  onToggleBookmark,
  onCharacterCompleted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showWritingCanvas, setShowWritingCanvas] = useState(false);

  if (!vocabList || vocabList.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-stone-400">
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
    <div className="max-w-md mx-auto space-y-4">
      {/* Top Header & Counter Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-stone-500">
        <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200/60">
          {currentWord.category}
        </span>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-stone-900 font-bold text-sm">{safeIndex + 1}</span>
          <span className="text-stone-400">/</span>
          <span>{vocabList.length}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-red-700 h-full transition-all duration-300"
          style={{ width: `${((safeIndex + 1) / vocabList.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Body */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden relative transition-all">
        {/* Card Top Actions: Bookmark */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="text-[11px] font-medium text-stone-400">
            {currentStatus === 'mastered' ? '🏆 Sudah Hafal' : currentStatus === 'learning' ? '⏳ Sedang Dipelajari' : '🌱 Kata Baru'}
          </div>
          <button
            onClick={() => onToggleBookmark(currentWord.id)}
            className={`p-2 rounded-xl transition ${
              isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
            }`}
            title="Tandai favorit"
          >
            <Star className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Central Character & Pronunciation */}
        <div className="p-6 pt-2 pb-4 text-center">
          <div className="relative inline-block my-2">
            <h2 className="text-6xl sm:text-7xl font-bold font-serif text-stone-900 tracking-wider">
              {currentWord.hanzi}
            </h2>
            <button
              onClick={() => handleAudio()}
              className="absolute -right-10 top-1/2 -translate-y-1/2 p-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-full transition shadow-xs active:scale-95"
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
                className="w-full py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2 border border-stone-200/80 active:scale-98"
              >
                <Eye className="w-4 h-4 text-stone-500" />
                <span>Buka Arti & Pinyin</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-stone-100 space-y-2 animate-in fade-in">
              <div className="text-xl font-bold text-red-700 tracking-wide">
                {currentWord.pinyin}
              </div>
              <div className="text-base font-semibold text-stone-900">
                {currentWord.indonesian}
              </div>
              <div className="text-xs text-stone-400">
                {currentWord.english}
              </div>

              {/* Example sentence */}
              {currentWord.examples && currentWord.examples[0] && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-left text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-bold">
                    <span>Contoh Kalimat</span>
                    <button
                      onClick={() => speechManager.speak(currentWord.examples[0].hanzi)}
                      className="text-stone-400 hover:text-red-700 p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-semibold text-stone-900 text-sm">{currentWord.examples[0].hanzi}</div>
                  <div className="text-red-800">{currentWord.examples[0].pinyin}</div>
                  <div className="text-stone-600 italic">{currentWord.examples[0].indonesian}</div>
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
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{showWritingCanvas ? 'Tutup Kanvas Tulis' : 'Latihan Tulis Karakter Ini'}</span>
          </button>

          {showWritingCanvas && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex justify-center animate-in fade-in">
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
        <div className="bg-stone-50 p-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <button
            onClick={() => onStatusChange(currentWord.id, 'new')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition ${
              currentStatus === 'new' ? 'bg-stone-300 text-stone-900 font-bold' : 'text-stone-500 hover:bg-stone-200'
            }`}
          >
            Ulangi
          </button>
          <button
            onClick={() => onStatusChange(currentWord.id, 'learning')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
              currentStatus === 'learning' ? 'bg-amber-200 text-amber-950 font-bold' : 'text-stone-500 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3 h-3" /> Belajar
          </button>
          <button
            onClick={() => onStatusChange(currentWord.id, 'mastered')}
            className={`flex-1 py-1.5 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
              currentStatus === 'mastered' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-stone-500 hover:bg-emerald-100'
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
          className="flex-1 py-3 bg-white border border-stone-200 rounded-2xl font-semibold text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center gap-1 shadow-xs"
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
