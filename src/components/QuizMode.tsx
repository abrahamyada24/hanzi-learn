import React, { useState, useMemo } from 'react';
import type { VocabItem } from '../types';
import { speechManager } from '../utils/speech';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { AudioButton, focusRing } from './ui/marks';

interface QuizModeProps {
  vocabList: VocabItem[];
  onFinishQuiz: (correctCount: number, totalQuestions: number) => void;
  onExit: () => void;
}

type QuizType = 'hanzi_to_meaning' | 'meaning_to_hanzi' | 'writing';

export const QuizMode: React.FC<QuizModeProps> = ({
  vocabList,
  onFinishQuiz,
  onExit
}) => {
  const [quizType, setQuizType] = useState<QuizType>('hanzi_to_meaning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [writingSuccess, setWritingSuccess] = useState(false);

  // Take a slice of 10 random questions from vocabList
  const questions = useMemo(() => {
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [vocabList, quizType]);

  const currentItem = questions[currentIndex];

  // Generate 4 multiple choices for multiple choice quiz
  const options = useMemo(() => {
    if (!currentItem) return [];
    const pool = vocabList.filter(v => v.id !== currentItem.id);
    const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [currentItem, ...shuffledPool].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentItem, vocabList]);

  const handleSelectOption = (answerItem: VocabItem) => {
    if (isAnswered) return;
    setSelectedAnswer(answerItem.id);
    setIsAnswered(true);

    const isCorrect = answerItem.id === currentItem.id;
    if (isCorrect) {
      setScore(prev => prev + 1);
      speechManager.speak(currentItem.hanzi);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setWritingSuccess(false);
    } else {
      // Completed quiz!
      setQuizFinished(true);
      onFinishQuiz(score + (isAnswered && selectedAnswer === currentItem?.id ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setWritingSuccess(false);
  };

  const handleWritingCompleted = (_char: string, _mistakes: number) => {
    setWritingSuccess(true);
    if (!isAnswered) {
      setIsAnswered(true);
      setScore(prev => prev + 1);
    }
  };

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto animate-in fade-in">
        <div className="border-t-2 border-ink pt-3 flex justify-between">
          <span className={label}>Kuis selesai</span>
          <span className={`${label} tabular-nums`}>{questions.length} soal</span>
        </div>
        <div className="mt-8 flex items-end gap-2 leading-none">
          <span className="text-[8rem] sm:text-[11rem] font-semibold tracking-tighter text-ink">{percentage}</span>
          <span className="pb-4 sm:pb-6 text-3xl font-semibold text-vermilion">%</span>
        </div>
        <p className="mt-3 text-sm text-muted">
          Kamu menjawab <span className="font-semibold text-ink">{score}</span> dari{' '}
          <span className="font-semibold text-ink">{questions.length}</span> pertanyaan dengan benar.
        </p>
        <div className="mt-8 h-1.5 w-full bg-ink/15">
          <div className="h-full bg-ink" style={{ width: `${percentage}%` }} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={handleRestart}
            className={`bg-ink text-paper px-5 py-3.5 text-sm font-semibold flex justify-between hover:bg-vermilion transition-colors ${focusRing}`}
          >
            <span>Ulangi kuis</span>
            <span aria-hidden>&rarr;</span>
          </button>
          <button
            onClick={onExit}
            className={`border border-ink text-ink px-5 py-3.5 text-sm font-semibold hover:bg-ink hover:text-paper transition-colors ${focusRing}`}
          >
            Kembali ke kata
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  const modes: [QuizType, string][] = [
    ['hanzi_to_meaning', 'Tebak arti'],
    ['meaning_to_hanzi', 'Tebak Hanzi'],
    ['writing', 'Tulis Hanzi']
  ];

  return (
    <div className="max-w-xl mx-auto">
      <div className="border-t-2 border-ink pt-3 flex items-baseline justify-between">
        <span className={label}>Kuis</span>
        <span className={`${label} tabular-nums`}>
          Soal <span className="text-ink font-semibold">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(questions.length).padStart(2, '0')}
        </span>
      </div>

      <div role="tablist" aria-label="Jenis kuis" className="mt-4 flex gap-5 text-sm">
        {modes.map(([type, name]) => (
          <button
            key={type}
            role="tab"
            aria-selected={quizType === type}
            onClick={() => { setQuizType(type); handleRestart(); }}
            className={`pb-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion ${
              quizType === type ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-4 h-0.5 w-full bg-ink/15">
        <div className="h-full bg-ink transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Prompt */}
      {quizType === 'hanzi_to_meaning' && (
        <div className="py-10 text-center">
          <div className="font-serif font-black text-ink text-[7rem] sm:text-[9rem] leading-none tracking-tight">{currentItem.hanzi}</div>
          <div className="mt-5 flex justify-center">
            <AudioButton
              onClick={() => speechManager.speak(currentItem.hanzi)}
              label="Dengar audio"
              className="border border-ink px-3 py-1.5 hover:bg-ink hover:!text-paper"
            />
          </div>
          <p className="mt-5 text-xs text-muted">Pilih arti bahasa Indonesia dan pinyin yang tepat.</p>
        </div>
      )}

      {quizType === 'meaning_to_hanzi' && (
        <div className="py-10">
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">{currentItem.indonesian}</div>
          <div className="mt-1 text-sm text-muted">{currentItem.english}</div>
          <p className="mt-5 text-xs text-muted">Pilih karakter Hanzi yang sesuai.</p>
        </div>
      )}

      {quizType === 'writing' && (
        <div className="py-8">
          <div className="text-3xl font-semibold tracking-tight text-ink">{currentItem.indonesian}</div>
          <div className="mt-1 text-xl font-semibold text-vermilion">{currentItem.pinyin}</div>
          <p className="mt-2 text-xs text-muted">Tulis karakter di bawah sesuai urutan goresan.</p>
          <div className="flex justify-center mt-5">
            <HanziWriterCanvas
              text={currentItem.hanzi}
              pinyin={currentItem.pinyin}
              meaning={currentItem.indonesian}
              size={260}
              onCharacterComplete={handleWritingCompleted}
            />
          </div>
        </div>
      )}

      {/* Options */}
      {quizType !== 'writing' && (
        <div className="border-t border-ink">
          {options.map((opt, i) => {
            const isCorrect = opt.id === currentItem.id;
            const isSelected = selectedAnswer === opt.id;
            const wrong = isAnswered && isSelected && !isCorrect;
            const right = isAnswered && isCorrect;

            let tone = 'text-ink hover:bg-paper-2';
            if (right) tone = 'bg-ink text-paper';
            else if (wrong) tone = 'text-vermilion bg-paper-2';
            else if (isAnswered) tone = 'text-muted opacity-60';

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`relative w-full grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-3 py-4 text-left border-b border-ink/20 transition-colors disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${tone}`}
              >
                {wrong && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-vermilion" />}
                <span className="text-xs tabular-nums opacity-70">{String.fromCharCode(65 + i)}</span>
                <span>
                  {quizType === 'hanzi_to_meaning' ? (
                    <>
                      <span className="block font-semibold text-base">{opt.indonesian}</span>
                      <span className={`block text-xs mt-0.5 ${right ? 'text-paper/80' : wrong ? '' : 'text-vermilion'}`}>{opt.pinyin}</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-serif font-black text-3xl leading-none">{opt.hanzi}</span>
                      <span className={`block text-xs mt-1.5 ${right ? 'text-paper/80' : wrong ? '' : 'text-vermilion'}`}>{opt.pinyin}</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {right ? 'Benar' : wrong ? 'Salah' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className={`text-xs text-muted underline underline-offset-4 decoration-1 hover:text-ink ${focusRing}`}
        >
          Keluar dari kuis
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={!isAnswered && !writingSuccess}
          className={`bg-ink text-paper px-6 py-3.5 text-sm font-semibold flex items-center justify-between gap-8 min-w-52 hover:bg-vermilion transition-colors disabled:opacity-30 disabled:pointer-events-none ${focusRing}`}
        >
          <span>{currentIndex === questions.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'}</span>
          <span aria-hidden>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
