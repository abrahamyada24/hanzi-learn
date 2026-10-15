import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, RotateCcw, Volume2, Trophy, ArrowRight, PenTool } from 'lucide-react';
import type { VocabItem } from '../types';
import { speechManager } from '../utils/speech';
import { HanziWriterCanvas } from './HanziWriterCanvas';

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
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
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

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-8 max-w-lg mx-auto text-center animate-in fade-in">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Kuis Selesai!</h2>
        <p className="text-stone-500 text-sm mt-1">
          Kamu menjawab <strong className="text-stone-800">{score}</strong> dari <strong className="text-stone-800">{questions.length}</strong> pertanyaan dengan benar.
        </p>

        <div className="my-6 p-4 bg-stone-50 rounded-2xl border border-stone-100 inline-block min-w-[200px]">
          <div className="text-3xl font-extrabold text-red-700">{percentage}%</div>
          <div className="text-xs text-stone-400 mt-0.5">Akurasi Jawaban</div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="px-5 py-2.5 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 shadow transition flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Ulangi Kuis
          </button>
          <button
            onClick={onExit}
            className="px-5 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition text-sm"
          >
            Kembali ke Daftar Kata
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 max-w-xl mx-auto">
      {/* Top Bar: Mode selector & Question counter */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
        {/* Type toggle */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
          <button
            onClick={() => { setQuizType('hanzi_to_meaning'); handleRestart(); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              quizType === 'hanzi_to_meaning' ? 'bg-white text-stone-900 shadow-sm' : ''
            }`}
          >
            Tebak Arti
          </button>
          <button
            onClick={() => { setQuizType('meaning_to_hanzi'); handleRestart(); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              quizType === 'meaning_to_hanzi' ? 'bg-white text-stone-900 shadow-sm' : ''
            }`}
          >
            Tebak Hanzi
          </button>
          <button
            onClick={() => { setQuizType('writing'); handleRestart(); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              quizType === 'writing' ? 'bg-white text-stone-900 shadow-sm' : ''
            }`}
          >
            <PenTool className="w-3 h-3" />
            Tulis Hanzi
          </button>
        </div>

        <div className="text-xs font-bold text-stone-400">
          Soal {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-red-700 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Prompt Area */}
      {quizType === 'hanzi_to_meaning' && (
        <div className="text-center my-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-6xl font-bold font-serif text-stone-900">{currentItem.hanzi}</span>
            <button
              onClick={() => speechManager.speak(currentItem.hanzi)}
              className="p-2 text-stone-400 hover:text-red-700 rounded-full hover:bg-stone-50"
              title="Dengar audio"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
          <div className="text-stone-400 text-xs mt-3">Pilih arti bahasa Indonesia dan pinyin yang tepat:</div>
        </div>
      )}

      {quizType === 'meaning_to_hanzi' && (
        <div className="text-center my-6">
          <div className="text-2xl font-bold text-stone-900">{currentItem.indonesian}</div>
          <div className="text-stone-500 text-sm mt-1">{currentItem.english}</div>
          <div className="text-stone-400 text-xs mt-3">Pilih karakter Hanzi yang sesuai:</div>
        </div>
      )}

      {quizType === 'writing' && (
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-stone-900 mb-0.5">{currentItem.indonesian}</div>
          <div className="text-red-700 font-bold text-base">{currentItem.pinyin}</div>
          <p className="text-xs text-stone-400 mt-1">Tulis karakter di bawah sesuai urutan goresan:</p>

          <div className="flex justify-center mt-3">
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

      {/* Options for multiple-choice quiz */}
      {quizType !== 'writing' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {options.map((opt) => {
            const isCorrect = opt.id === currentItem.id;
            const isSelected = selectedAnswer === opt.id;

            let btnStyle = 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100 hover:border-stone-300';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
              } else if (isSelected) {
                btnStyle = 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20';
              } else {
                btnStyle = 'opacity-40 bg-stone-50 border-stone-200 text-stone-400';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div>
                  {quizType === 'hanzi_to_meaning' ? (
                    <>
                      <div className="font-bold text-sm text-stone-900">{opt.indonesian}</div>
                      <div className="text-red-700 font-medium text-xs mt-0.5">{opt.pinyin}</div>
                    </>
                  ) : (
                    <>
                      <div className="font-serif font-bold text-2xl text-stone-900">{opt.hanzi}</div>
                      <div className="text-red-700 font-medium text-xs mt-0.5">{opt.pinyin}</div>
                    </>
                  )}
                </div>

                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Action */}
      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-xs font-semibold text-stone-400 hover:text-stone-700"
        >
          Keluar dari Kuis
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!isAnswered && !writingSuccess}
          className="px-5 py-2.5 bg-red-700 text-white font-semibold text-sm rounded-xl hover:bg-red-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>{currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
