import { useState, useEffect } from 'react';
import type { VocabItem, MasteryStatus } from '../types';
import { speechManager } from '../utils/speech';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { AudioButton, BookmarkIcon, StatusSwitch, focusRing } from './ui/marks';

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
    return <p className="border-y border-ink/20 py-10 text-center text-sm text-muted">Tidak ada kata dalam bab ini.</p>;
  }

  const safeIndex = Math.min(currentIndex, vocabList.length - 1);
  const currentWord = vocabList[safeIndex];
  const isBookmarked = bookmarks.includes(currentWord.id);
  const currentStatus: MasteryStatus = progress[currentWord.id]?.status || 'new';

  const go = (delta: number) => {
    const next = safeIndex + delta;
    if (next < 0 || next >= vocabList.length) return;
    setCurrentIndex(next);
    setIsRevealed(false);
    setShowWritingCanvas(false);
  };

  const handleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    speechManager.speak(currentWord.hanzi);
  };

  const example = currentWord.examples?.[0];

  return (
    <div className="max-w-xl mx-auto">
      {/* Counter */}
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        <span>{currentWord.category}</span>
        <span className="tabular-nums">
          <span className="text-ink font-semibold">{String(safeIndex + 1).padStart(2, '0')}</span> / {String(vocabList.length).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-2 h-0.5 w-full bg-ink/15">
        <div className="h-full bg-ink transition-all duration-300" style={{ width: `${((safeIndex + 1) / vocabList.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="mt-6 border border-ink">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink/20 text-xs">
          <span className="text-muted">
            {currentStatus === 'mastered' ? 'Sudah hafal' : currentStatus === 'learning' ? 'Sedang dipelajari' : 'Kata baru'}
          </span>
          <button
            onClick={() => onToggleBookmark(currentWord.id)}
            aria-pressed={isBookmarked}
            className={`flex items-center gap-1.5 text-muted hover:text-ink transition-colors ${focusRing}`}
            title="Tandai favorit"
          >
            <BookmarkIcon active={isBookmarked} className="w-4 h-4" />
            <span className={isBookmarked ? 'text-vermilion font-semibold' : ''}>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>

        {/* Hanzi */}
        <div className="px-6 pt-10 pb-8 text-center">
          <h2 className="font-serif font-black text-ink text-[7rem] sm:text-[9rem] leading-none tracking-tight">{currentWord.hanzi}</h2>
          <div className="mt-6 flex justify-center">
            <AudioButton onClick={handleAudio} className="flex items-center gap-2 text-xs font-medium border border-ink px-3 py-1.5 hover:bg-ink hover:!text-paper" />
          </div>

          {!isRevealed ? (
            <button
              onClick={() => {
                setIsRevealed(true);
                handleAudio();
              }}
              className={`mt-8 w-full bg-ink text-paper py-3.5 text-sm font-semibold tracking-wide hover:bg-vermilion transition-colors flex justify-between px-5 ${focusRing}`}
            >
              <span>Buka arti &amp; pinyin</span>
              <span aria-hidden>&darr;</span>
            </button>
          ) : (
            <div className="mt-8 border-t border-ink pt-5 text-left animate-in fade-in">
              <div className="text-3xl font-semibold tracking-tight text-vermilion">{currentWord.pinyin}</div>
              <div className="mt-1 text-lg font-semibold text-ink">{currentWord.indonesian}</div>
              <div className="text-xs text-muted">{currentWord.english}</div>

              {example && (
                <div className="mt-5 border-t border-ink/20 pt-4">
                  <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    <span>Contoh kalimat</span>
                    <AudioButton
                      onClick={() => speechManager.speak(example.hanzi)}
                      label="Dengar contoh kalimat"
                      iconClass="w-4 h-4"
                      className="text-muted"
                    />
                  </div>
                  <div className="mt-2 font-serif font-bold text-xl text-ink">{example.hanzi}</div>
                  <div className="text-sm text-vermilion">{example.pinyin}</div>
                  <div className="text-sm text-muted">{example.indonesian}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Writing canvas */}
        <div className="border-t border-ink/20">
          <button
            onClick={() => setShowWritingCanvas(!showWritingCanvas)}
            aria-expanded={showWritingCanvas}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-ink hover:text-vermilion transition-colors ${focusRing}`}
          >
            <span>{showWritingCanvas ? 'Tutup kanvas tulis' : 'Latihan tulis karakter ini'}</span>
            <span aria-hidden>{showWritingCanvas ? '−' : '+'}</span>
          </button>
          {showWritingCanvas && (
            <div className="px-4 pb-5 flex justify-center animate-in fade-in">
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

        <StatusSwitch
          status={currentStatus}
          onChange={s => onStatusChange(currentWord.id, s)}
          className="!border-0 !border-t !border-ink"
        />
      </div>

      {/* Prev / next */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => go(-1)}
          disabled={safeIndex === 0}
          className={`border border-ink py-3.5 px-5 text-sm font-semibold text-ink flex justify-between hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:pointer-events-none ${focusRing}`}
        >
          <span aria-hidden>&larr;</span>
          <span>Sebelumnya</span>
        </button>
        <button
          onClick={() => go(1)}
          disabled={safeIndex === vocabList.length - 1}
          className={`bg-ink text-paper py-3.5 px-5 text-sm font-semibold flex justify-between hover:bg-vermilion transition-colors disabled:opacity-30 disabled:pointer-events-none ${focusRing}`}
        >
          <span>Selanjutnya</span>
          <span aria-hidden>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
