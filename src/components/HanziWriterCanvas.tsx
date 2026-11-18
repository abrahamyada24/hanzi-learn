import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { AudioButton } from './ui/marks';
import { focusRing } from './ui/tokens';
import { speechManager } from '../utils/speech';
import { useTheme } from '../context/ThemeContext';

interface HanziWriterCanvasProps {
  text: string; // Hanzi string (can be 1 or more characters, e.g. "你好")
  pinyin?: string;
  meaning?: string;
  size?: number;
  onCharacterComplete?: (char: string, mistakes: number) => void;
  className?: string;
}

export const HanziWriterCanvas: React.FC<HanziWriterCanvasProps> = ({
  text,
  pinyin,
  meaning,
  size = 280,
  onCharacterComplete,
  className = ''
}) => {
  const { isDark } = useTheme();
  // Extract all Chinese characters from the string
  const characters = text.split('').filter(c => /[\u4e00-\u9fa5]/.test(c));
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const [mode, setMode] = useState<'view' | 'animate' | 'quiz'>('view');
  const [showOutline, setShowOutline] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [animating, setAnimating] = useState(false);
  const [quizStatus, setQuizStatus] = useState<{
    active: boolean;
    mistakes: number;
    completed: boolean;
    currentStroke: number;
    totalStrokes: number;
  }>({
    active: false,
    mistakes: 0,
    completed: false,
    currentStroke: 0,
    totalStrokes: 0
  });

  const currentChar = characters[currentCharIndex] || text[0] || '你';

  // Initialize writer when character or size changes
  useEffect(() => {
    if (!containerRef.current || !currentChar) return;

    // Clear previous SVG
    containerRef.current.innerHTML = '';
    setQuizStatus({
      active: false,
      mistakes: 0,
      completed: false,
      currentStroke: 0,
      totalStrokes: 0
    });
    setMode('view');
    setAnimating(false);

    try {
      const writer = HanziWriter.create(containerRef.current, currentChar, {
        width: size,
        height: size,
        padding: 18,
        showOutline: showOutline,
        strokeAnimationSpeed: speed,
        delayBetweenStrokes: 150,
        strokeColor: isDark ? '#efe8da' : '#1b1816', // ink
        outlineColor: isDark ? '#3a342e' : '#d8d0bd', // faint guide line on paper
        drawingColor: isDark ? '#efe8da' : '#1b1816', // user brush = ink
        drawingWidth: 16,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        highlightColor: isDark ? '#e8553f' : '#c0301c', // vermilion flash on a correct stroke
        charDataLoader: (char, onComplete, onError) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
            .then(res => {
              if (!res.ok) throw new Error('Network response not ok');
              return res.json();
            })
            .then(data => onComplete(data))
            .catch(err => {
              console.error('Error loading Hanzi data:', err);
              onError(err);
            });
        }
      });

      writerRef.current = writer;
    } catch (e) {
      console.error('Failed to init HanziWriter', e);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
    };
  }, [currentChar, size, isDark]);

  // Handle outline toggle
  useEffect(() => {
    if (!writerRef.current) return;
    if (showOutline) {
      writerRef.current.showOutline();
    } else {
      writerRef.current.hideOutline();
    }
  }, [showOutline]);

  // Play stroke order animation
  const handlePlayAnimation = () => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    setMode('animate');
    setAnimating(true);
    setQuizStatus(prev => ({ ...prev, active: false }));

    writerRef.current.showOutline();
    writerRef.current.animateCharacter({
      onComplete: () => {
        setAnimating(false);
      }
    });
  };

  // Start interactive writing quiz
  const handleStartQuiz = () => {
    if (!writerRef.current) return;
    setMode('quiz');
    setAnimating(false);
    setQuizStatus({
      active: true,
      mistakes: 0,
      completed: false,
      currentStroke: 0,
      totalStrokes: 0
    });

    if (!showOutline) {
      writerRef.current.hideOutline();
    }

    writerRef.current.quiz({
      showOutline: showOutline,
      showHintAfterMisses: 2,
      onMistake: (strokeData) => {
        setQuizStatus(prev => ({
          ...prev,
          mistakes: prev.mistakes + 1,
          currentStroke: strokeData.strokeNum
        }));
      },
      onCorrectStroke: (strokeData) => {
        setQuizStatus(prev => ({
          ...prev,
          currentStroke: strokeData.strokeNum + 1
        }));
      },
      onComplete: (summary) => {
        setQuizStatus(prev => ({
          ...prev,
          completed: true,
          mistakes: summary.totalMistakes
        }));

        // Trigger callback for tracking stats
        if (onCharacterComplete) {
          onCharacterComplete(currentChar, summary.totalMistakes);
        }
      }
    });
  };

  // Reset character to initial idle state
  const handleReset = () => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    setMode('view');
    setAnimating(false);
    setQuizStatus({
      active: false,
      mistakes: 0,
      completed: false,
      currentStroke: 0,
      totalStrokes: 0
    });
    writerRef.current.showCharacter();
    if (showOutline) {
      writerRef.current.showOutline();
    }
  };

  const handleAudio = () => {
    speechManager.speak(currentChar);
  };

  const handleFullWordAudio = () => {
    speechManager.speak(text);
  };

  const small = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

  return (
    <div className={`flex flex-col items-center border border-ink bg-paper p-4 ${className}`}>
      {/* Header: character tabs, audio, pinyin */}
      <div className="w-full flex items-start justify-between gap-3 pb-3 border-b border-ink/20 mb-4">
        <div className="flex items-center gap-3">
          {characters.length > 1 ? (
            <div className="flex items-center gap-1" role="tablist" aria-label="Karakter">
              {characters.map((char, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={currentCharIndex === idx}
                  onClick={() => setCurrentCharIndex(idx)}
                  className={`px-2.5 py-1 font-serif font-black text-xl border transition-colors ${focusRing} ${
                    currentCharIndex === idx ? 'bg-ink text-paper border-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          ) : (
            <span className="font-serif font-black text-3xl leading-none text-ink">{currentChar}</span>
          )}

          <AudioButton onClick={handleAudio} label="Dengarkan pelafalan karakter ini" iconClass="w-5 h-5" />

          {characters.length > 1 && (
            <button
              onClick={handleFullWordAudio}
              title="Dengarkan pelafalan seluruh kata"
              className={`text-xs font-semibold text-ink underline underline-offset-4 decoration-1 hover:text-vermilion ${focusRing}`}
            >
              Seluruh kata
            </button>
          )}
        </div>

        <div className="text-right min-w-0">
          {pinyin && <div className="text-sm font-semibold text-vermilion">{pinyin}</div>}
          {meaning && <div className="text-xs text-muted max-w-[180px] truncate">{meaning}</div>}
        </div>
      </div>

      {/* Canvas on a Mi Zi Ge grid */}
      <div className="relative">
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
          className="mizige-bg border border-ink overflow-hidden cursor-crosshair touch-none select-none"
        />

        {mode === 'quiz' && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
            <span className="bg-ink text-paper text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-1">Mode tulis</span>
            {quizStatus.mistakes > 0 && (
              <span className="bg-paper border border-vermilion text-vermilion text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-1">
                Salah {quizStatus.mistakes}
              </span>
            )}
          </div>
        )}

        {quizStatus.completed && (
          <div className="absolute inset-0 bg-paper/95 flex flex-col items-center justify-center p-4 text-center animate-in fade-in border border-ink">
            <h4 className="text-4xl font-semibold tracking-tight text-ink">Selesai</h4>
            <p className="text-xs text-muted mt-1">
              {quizStatus.mistakes === 0 ? 'Goresan sempurna, tanpa salah.' : `Berhasil dengan ${quizStatus.mistakes} kesalahan.`}
            </p>
            <div className="flex gap-2 mt-4 pointer-events-auto">
              <button
                onClick={handleStartQuiz}
                className={`border border-ink text-ink px-3 py-2 text-xs font-semibold hover:bg-ink hover:text-paper transition-colors ${focusRing}`}
              >
                Tulis lagi
              </button>
              {characters.length > 1 && currentCharIndex < characters.length - 1 && (
                <button
                  onClick={() => setCurrentCharIndex(prev => prev + 1)}
                  className={`bg-ink text-paper px-3 py-2 text-xs font-semibold hover:bg-vermilion transition-colors ${focusRing}`}
                >
                  Karakter berikutnya &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePlayAnimation}
            disabled={animating}
            aria-pressed={mode === 'animate'}
            className={`py-2.5 px-3 text-sm font-semibold border border-ink transition-colors disabled:pointer-events-none ${focusRing} ${
              mode === 'animate' ? 'bg-paper-2 text-ink' : 'text-ink hover:bg-ink hover:text-paper'
            }`}
          >
            {animating ? 'Memutar…' : 'Animasi goresan'}
          </button>
          <button
            onClick={handleStartQuiz}
            aria-pressed={mode === 'quiz'}
            className={`py-2.5 px-3 text-sm font-semibold bg-ink text-paper hover:bg-vermilion transition-colors ${focusRing}`}
          >
            Latihan tulis
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted border-t border-ink/20 pt-3">
          <button
            onClick={() => setShowOutline(!showOutline)}
            aria-pressed={showOutline}
            className={`hover:text-ink transition-colors ${focusRing}`}
            title="Sembunyikan atau tampilkan bayangan garis bantu tulisan"
          >
            Panduan: <span className={showOutline ? 'text-ink font-semibold' : ''}>{showOutline ? 'aktif' : 'nonaktif'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={small}>Kecepatan</span>
            {[0.75, 1, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                className={`tabular-nums pb-0.5 border-b-2 transition-colors ${focusRing} ${
                  speed === s ? 'border-vermilion text-ink font-semibold' : 'border-transparent hover:text-ink'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className={`hover:text-ink transition-colors ${focusRing}`}
            title="Kembalikan tampilan awal"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted text-center">
        Goreskan mouse atau jarimu di atas kotak sesuai urutan goresan Hanzi.
      </p>
    </div>
  );
};
