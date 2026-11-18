import React, { useState } from 'react';
import { CHARACTER_STORIES } from '../data/characterStories';
import type { CharacterStory } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { EntryPicker } from './ui/EntryPicker';
import { AudioButton, focusRing } from './ui/marks';

const TAGS = ['Semua', 'Alam', 'Orang', 'Tumbuhan', 'Elemen', 'Aktivitas', 'Waktu'];
const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

export const CharacterStoriesView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<CharacterStory>(CHARACTER_STORIES[0]);
  const [selectedTag, setSelectedTag] = useState<string>('Semua');

  const choose = (item: CharacterStory) => {
    setSelectedStory(item);
    speechManager.speak(item.character);
  };

  const origin = selectedStory.pictogramOrigin.split('(')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <EntryPicker
        items={CHARACTER_STORIES}
        selected={selectedStory}
        onSelect={choose}
        getId={s => s.id}
        glyph={s => s.character}
        primary={s => s.pinyin}
        secondary={s => s.meaning}
        meta={s => s.type.split(' ')[0]}
        matches={(s, q) => s.character.includes(q) || s.pinyin.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q)}
        prefilter={s => selectedTag === 'Semua' || s.tags.includes(selectedTag)}
        searchPlaceholder="Cari aksara, pinyin, atau arti"
        prevLabel="Aksara sebelumnya"
        nextLabel="Aksara berikutnya"
        emptyLabel={q => `Tidak ada aksara yang sesuai dengan "${q}"`}
        filterRow={
          <div className="flex items-center gap-4 overflow-x-auto text-xs">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
                className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${focusRing} ${
                  selectedTag === tag ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        }
      />

      {/* Entry */}
      <article className="space-y-8">
        <header className="border-t-2 border-ink pt-3">
          <div className="flex items-baseline justify-between">
            <span className={label}>{selectedStory.type}</span>
            <span className={label}>HSK 1 piktogram</span>
          </div>
          <div className="mt-4 pb-3 flex items-end justify-between gap-4">
            <div className="flex items-end gap-5 min-w-0">
              <h2 className="font-serif font-black text-ink text-[6rem] sm:text-[8rem] leading-[0.85]">{selectedStory.character}</h2>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold tracking-tight text-vermilion">{selectedStory.pinyin}</span>
                  <AudioButton onClick={() => speechManager.speak(selectedStory.character)} />
                </div>
                <div className="text-base font-semibold text-ink">{selectedStory.meaning}</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 pb-1 max-w-[9rem]">
              <div className={label}>Bentuk purba</div>
              <div className="mt-1 text-sm font-semibold text-ink leading-tight">{origin}</div>
            </div>
          </div>
        </header>

        <section>
          <div className={`${label} mb-3`}>Kanvas animasi &amp; latihan tulis</div>
          <div className="flex justify-center">
            <HanziWriterCanvas text={selectedStory.character} pinyin={selectedStory.pinyin} meaning={selectedStory.meaning} size={220} />
          </div>
        </section>

        <section className="border-t border-ink pt-3">
          <div className={label}>Kisah &amp; logika huruf</div>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">{selectedStory.story}</p>
        </section>

        {selectedStory.components && selectedStory.components.length > 0 && (
          <section className="border-t border-ink pt-3">
            <div className={label}>Penyusun karakter</div>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10">
              {selectedStory.components.map((comp, idx) => (
                <li key={idx} className="flex items-center gap-4 border-b border-ink/20 py-3">
                  <span className="font-serif font-black text-3xl leading-none w-10 text-center text-ink">{comp.char}</span>
                  <span className="text-sm text-ink">{comp.meaning}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {selectedStory.sampleWords && selectedStory.sampleWords.length > 0 && (
          <section className="border-t border-ink pt-3">
            <div className={label}>Kata yang memakai huruf ini</div>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-ink/20 border-b border-ink/20">
              {selectedStory.sampleWords.map((item, idx) => (
                <li key={idx} className={idx > 0 ? 'border-t border-ink/20 sm:border-t-0' : ''}>
                  <button
                    onClick={() => speechManager.speak(item.word)}
                    className={`group w-full text-left px-0 sm:px-4 py-4 sm:first:pl-0 hover:bg-paper-2 transition-colors ${focusRing}`}
                  >
                    <span className="block font-serif font-black text-2xl text-ink group-hover:text-vermilion transition-colors">{item.word}</span>
                    <span className="block text-sm font-semibold text-vermilion">{item.pinyin}</span>
                    <span className="block text-xs text-muted truncate">{item.meaning}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
};
