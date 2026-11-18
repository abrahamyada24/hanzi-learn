import React, { useState } from 'react';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { AudioButton, focusRing } from './ui/marks';

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

const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

export const CustomCharacterSandbox: React.FC = () => {
  const [inputText, setInputText] = useState('永');
  const [activeText, setActiveText] = useState('永');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputText.trim();
    if (value) setActiveText(value);
  };

  const handleSelectSuggestion = (char: string) => {
    setInputText(char);
    setActiveText(char);
    speechManager.speak(char);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in">
      <header className="border-t-2 border-ink pt-3">
        <span className={label}>Tulis bebas</span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-ink">Karakter apa saja</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Mau coba karakter di luar HSK 1? Masukkan Hanzi dari lagu, film, atau namamu untuk melihat animasi urutan goresan dan berlatih menulisnya.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex items-end gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="龙, 梦, 谢谢"
              aria-label="Karakter Hanzi"
              className="w-full bg-transparent border-b-2 border-ink pb-2 pr-10 font-serif font-black text-4xl text-ink placeholder:text-muted/50 focus:outline-none focus:border-vermilion"
            />
            {inputText && (
              <AudioButton
                onClick={() => speechManager.speak(inputText)}
                label="Dengar pelafalan"
                className="absolute right-0 bottom-3"
              />
            )}
          </div>
          <button
            type="submit"
            className={`bg-ink text-paper px-5 py-3 text-sm font-semibold hover:bg-vermilion transition-colors flex-shrink-0 ${focusRing}`}
          >
            Lihat goresan
          </button>
        </form>

        <div className="mt-6 border-t border-ink/20 pt-3">
          <span className={label}>Coba karakter populer</span>
          <ul className="mt-2 flex flex-wrap border-l border-t border-ink/20 w-fit max-w-full">
            {POPULAR_SUGGESTIONS.map(item => {
              const on = activeText === item.char;
              return (
                <li key={item.char} className="border-r border-b border-ink/20">
                  <button
                    onClick={() => handleSelectSuggestion(item.char)}
                    aria-pressed={on}
                    title={item.note}
                    className={`px-4 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${on ? 'bg-ink text-paper' : 'hover:bg-paper-2 text-ink'}`}
                  >
                    <span className="block font-serif font-black text-2xl leading-none">{item.char}</span>
                    <span className={`block mt-1 text-[10px] ${on ? 'text-paper/70' : 'text-muted'}`}>{item.note.match(/\(([^)]+)\)/)?.[1] ?? item.char}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </header>

      {activeText && (
        <div className="flex justify-center animate-in fade-in">
          <HanziWriterCanvas text={activeText} size={280} />
        </div>
      )}

      <section className="border-l-2 border-vermilion pl-4">
        <div className={label}>Tips menulis aksara Mandarin</div>
        <ol className="mt-2 space-y-1 text-sm text-ink list-decimal list-inside marker:text-muted">
          <li>Goresan dimulai dari <strong>atas ke bawah</strong> (上到下).</li>
          <li>Dari <strong>kiri ke kanan</strong> (左到右).</li>
          <li>Garis horizontal sebelum vertikal (先横后竖).</li>
          <li>Masuk ke dalam kotak sebelum menutup pintunya (先进入后关门).</li>
        </ol>
      </section>
    </div>
  );
};
