import React, { useState } from 'react';
import { RADICALS_DATA } from '../data/radicals';
import type { RadicalItem } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { EntryPicker } from './ui/EntryPicker';
import { AudioButton, focusRing } from './ui/marks';

const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';

export const RadicalsView: React.FC = () => {
  const [selected, setSelected] = useState<RadicalItem>(RADICALS_DATA[0]);

  const choose = (item: RadicalItem) => {
    setSelected(item);
    speechManager.speak(item.radical);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <EntryPicker
        items={RADICALS_DATA}
        selected={selected}
        onSelect={choose}
        getId={r => r.id}
        glyph={r => r.radical}
        primary={r => r.pinyin}
        secondary={r => r.meaningId}
        meta={r => `${r.strokeCount} goresan`}
        matches={(r, q) =>
          r.radical.includes(q) ||
          r.pinyin.toLowerCase().includes(q) ||
          r.meaningId.toLowerCase().includes(q) ||
          r.examples.some(e => e.includes(q))
        }
        searchPlaceholder="Cari radikal, pinyin, atau arti (air, orang, dll)"
        prevLabel="Radikal sebelumnya"
        nextLabel="Radikal berikutnya"
        emptyLabel={q => `Tidak ada radikal yang cocok dengan "${q}"`}
      />

      <article className="space-y-8">
        <header className="border-t-2 border-ink pt-3">
          <div className="flex items-baseline justify-between">
            <span className={label}>Radikal kunci (部首)</span>
            <span className={`${label} tabular-nums`}>{selected.strokeCount} goresan</span>
          </div>
          <div className="mt-4 pb-3 flex items-end justify-between gap-4">
            <div className="flex items-end gap-5 min-w-0">
              <h2 className="font-serif font-black text-ink text-[6rem] sm:text-[8rem] leading-[0.85]">{selected.radical}</h2>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold tracking-tight text-vermilion">{selected.pinyin}</span>
                  <AudioButton onClick={() => speechManager.speak(selected.radical)} />
                </div>
                <div className="text-base font-semibold text-ink">{selected.meaningId}</div>
              </div>
            </div>
            {selected.variants && selected.variants.length > 0 && (
              <div className="text-right flex-shrink-0 pb-1">
                <div className={label}>Variasi bentuk</div>
                <div className="mt-1 font-serif font-black text-2xl text-ink">{selected.variants.join(' ')}</div>
              </div>
            )}
          </div>
        </header>

        <section>
          <div className={`${label} mb-3`}>Kanvas animasi &amp; latihan tulis radikal</div>
          <div className="flex justify-center">
            <HanziWriterCanvas text={selected.radical} pinyin={selected.pinyin} meaning={selected.meaningId} size={220} />
          </div>
        </section>

        <section className="border-t border-ink pt-3">
          <div className={label}>Karakter yang mengandung radikal ini</div>
          <ul className="mt-3 flex flex-wrap border-l border-t border-ink/20 w-fit max-w-full">
            {selected.examples.map((char, idx) => (
              <li key={idx} className="border-r border-b border-ink/20">
                <button
                  onClick={() => speechManager.speak(char)}
                  className={`group px-5 py-3 hover:bg-ink transition-colors ${focusRing}`}
                  title="Dengarkan"
                  aria-label={`Dengarkan ${char}`}
                >
                  <span className="font-serif font-black text-3xl text-ink group-hover:text-paper transition-colors">{char}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
};
