import React, { useState } from 'react';
import { Search, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';

const POPULAR_SUGGESTIONS = [
  { char: '永', note: '8 Prinsip Dasar Goresan Hanzi (Yǒng)' },
  { char: '爱', note: 'Cinta (Ài)' },
  { char: '学', note: 'Belajar (Xué)' },
  { char: '福', note: 'Keberuntungan (Fú)' },
  { char: '龙', note: 'Naga (Lóng)' },
  { char: '家', note: 'Rumah (Jiā)' },
  { char: '梦', note: 'Mimpi (Mèng)' },
  { char: '美', note: 'Indah / Cantik (Měi)' },
];

export const CustomCharacterSandbox: React.FC = () => {
  const [inputText, setInputText] = useState('永');
  const [activeText, setActiveText] = useState('永');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    // Keep only Chinese characters
    const hanziOnly = inputText.trim();
    if (hanziOnly) {
      setActiveText(hanziOnly);
    }
  };

  const handleSelectSuggestion = (char: string) => {
    setInputText(char);
    setActiveText(char);
    speechManager.speak(char);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Ketik / Tempel Karakter Mandarin Apa Saja</span>
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            Mau coba karakter di luar HSK 1? Masukkan karakter Hanzi apa pun dari lagu, film, atau nama kamu untuk melihat animasi urutan goresan dan berlatih menulisnya.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik karakter Hanzi (contoh: 龙, 梦, 谢谢)..."
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-base font-serif"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => speechManager.speak(inputText)}
                className="absolute right-3 top-3 text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 transition"
                title="Dengar pelafalan"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-red-700 text-white font-semibold text-sm rounded-2xl hover:bg-red-800 transition shadow-sm flex items-center gap-1.5 active:scale-95 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Lihat Goresan</span>
          </button>
        </form>

        {/* Popular Suggestions */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 dark:text-stone-500 font-medium mr-2">Coba Karakter Populer:</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {POPULAR_SUGGESTIONS.map((item) => (
              <button
                key={item.char}
                onClick={() => handleSelectSuggestion(item.char)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                  activeText === item.char
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-900/60 font-bold'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
                title={item.note}
              >
                <span className="font-serif text-sm mr-1">{item.char}</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">{item.note.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Writing Canvas Display */}
      {activeText && (
        <div className="flex justify-center animate-in fade-in">
          <HanziWriterCanvas
            text={activeText}
            size={280}
            className="shadow-md"
          />
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-amber-50/60 dark:bg-stone-900 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 transition-colors">
        <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Tips Menulis Aksara Mandarin:</span>
          <ul className="list-disc pl-4 mt-1 space-y-0.5 text-stone-700 dark:text-stone-300">
            <li>Goresan selalu dimulai dari <strong>atas ke bawah</strong> (上到下).</li>
            <li>Dari <strong>kiri ke kanan</strong> (左到右).</li>
            <li>Garis horizontal sebelum vertikal (先横后竖).</li>
            <li>Masuk ke dalam kotak sebelum menutup pintunya (先进入后关门).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
