import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  PenTool, 
  Eye, 
  EyeOff, 
  Volume2, 
  AlertCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { speechManager } from '../utils/speech';

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
        strokeColor: '#b91c1c', // deep cinnabar red for stroke
        outlineColor: '#e5e7eb', // subtle light gray
        drawingColor: '#1e3a8a', // deep ink blue when user writes
        drawingWidth: 16,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        highlightColor: '#16a34a', // green flash on success
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
  }, [currentChar, size]);

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

        // Celebratory confetti trigger!
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.6 }
        });

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

  return (
    <div className={`flex flex-col items-center bg-white rounded-2xl border border-stone-200 shadow-sm p-4 ${className}`}>
      {/* Top Header: Multi-character Tabs (if > 1 char) */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          {characters.length > 1 ? (
            <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1">
              {characters.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCharIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-lg font-bold transition-all ${
                    currentCharIndex === idx
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-2xl font-bold text-stone-800">{currentChar}</span>
          )}

          <button
            onClick={handleAudio}
            title="Dengarkan pelafalan karakter ini"
            className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {characters.length > 1 && (
            <button
              onClick={handleFullWordAudio}
              title="Dengarkan pelafalan seluruh kata"
              className="px-2 py-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
            >
              Kata
            </button>
          )}
        </div>

        {/* Pinyin & Meaning info */}
        <div className="text-right">
          {pinyin && <div className="text-sm font-semibold text-red-700">{pinyin}</div>}
          {meaning && <div className="text-xs text-stone-500 max-w-[180px] truncate">{meaning}</div>}
        </div>
      </div>

      {/* Main Canvas Box with Mi Zi Ge Background Grid */}
      <div className="relative group">
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
          className="mizige-bg rounded-xl border-2 border-stone-300 shadow-inner overflow-hidden cursor-crosshair touch-none select-none"
        />

        {/* Status Overlay Badge */}
        {mode === 'quiz' && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
              <PenTool className="w-3 h-3" /> Mode Latihan Tulis
            </span>
            {quizStatus.mistakes > 0 && (
              <span className="bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
                <AlertCircle className="w-3 h-3" /> Salah: {quizStatus.mistakes}
              </span>
            )}
          </div>
        )}

        {/* Quiz Success Celebration Overlay */}
        {quizStatus.completed && (
          <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-4 text-center animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-emerald-900 font-bold text-lg">Hebat! Selesai!</h4>
            <p className="text-emerald-700 text-xs mt-0.5">
              {quizStatus.mistakes === 0 
                ? 'Goresan sempurna tanpa salah!' 
                : `Berhasil dengan ${quizStatus.mistakes} kesalahan.`}
            </p>

            <div className="flex gap-2 mt-3 pointer-events-auto">
              <button
                onClick={handleStartQuiz}
                className="px-3 py-1.5 bg-white text-emerald-700 font-medium text-xs rounded-lg shadow hover:bg-stone-50 border border-emerald-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Tulis Lagi
              </button>
              {characters.length > 1 && currentCharIndex < characters.length - 1 && (
                <button
                  onClick={() => setCurrentCharIndex(prev => prev + 1)}
                  className="px-3 py-1.5 bg-emerald-700 text-white font-medium text-xs rounded-lg shadow hover:bg-emerald-800 flex items-center gap-1"
                >
                  Karakter Berikutnya &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="w-full mt-4 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Animate Button */}
          <button
            onClick={handlePlayAnimation}
            disabled={animating}
            className={`py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all ${
              mode === 'animate'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Play className={`w-4 h-4 ${animating ? 'animate-pulse text-amber-700' : ''}`} />
            {animating ? 'Memutar...' : 'Animasi Goresan'}
          </button>

          {/* Quiz / Write Practice Button */}
          <button
            onClick={handleStartQuiz}
            className={`py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all ${
              mode === 'quiz'
                ? 'bg-red-700 text-white shadow-md'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Latihan Tulis
          </button>
        </div>

        {/* Secondary controls row */}
        <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
          {/* Outline toggle */}
          <button
            onClick={() => setShowOutline(!showOutline)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="Sembunyikan atau tampilkan bayangan garis bantu tulisan"
          >
            {showOutline ? <Eye className="w-3.5 h-3.5 text-stone-700" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
            <span>Panduan: {showOutline ? 'Aktif' : 'Nonaktif'}</span>
          </button>

          {/* Speed selector for animation */}
          <div className="flex items-center gap-1">
            <span className="text-stone-400 text-[11px]">Kecepatan:</span>
            {[0.75, 1, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                  speed === s ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="Kembalikan tampilan awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Guide Note for user */}
      <div className="mt-3 text-[11px] text-stone-400 flex items-center gap-1 text-center justify-center">
        <HelpCircle className="w-3 h-3 flex-shrink-0" />
        <span>Goreskan mouse atau jarimu di atas kotak sesuai urutan goresan Hanzi.</span>
      </div>
    </div>
  );
};
