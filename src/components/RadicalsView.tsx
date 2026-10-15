import React, { useState } from 'react';
import { RADICALS_DATA } from '../data/radicals';
import type { RadicalItem } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { Volume2, Sparkles } from 'lucide-react';

export const RadicalsView: React.FC = () => {
  const [selectedRadical, setSelectedRadical] = useState<RadicalItem>(RADICALS_DATA[0]);

  return (
    <div className="space-y-6">
      <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Rahasia Menghafal Hanzi: Kuasai Radikal Dasar (部首)</span>
        </h3>
        <p className="text-stone-600 text-xs mt-1 leading-relaxed">
          Karakter Mandarin bukanlah coretan acak! Sebagian besar Hanzi tersusun dari potongan-potongan kecil bernama <strong>Radikal</strong>.
          Mengetahui radikal membuatmu paham logika makna dan mempermudah menghafal goresan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radicals Grid Selector */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RADICALS_DATA.map((rad) => {
            const isSelected = selectedRadical.id === rad.id;
            return (
              <button
                key={rad.id}
                onClick={() => {
                  setSelectedRadical(rad);
                  speechManager.speak(rad.radical);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-red-50 border-red-500 shadow-sm ring-2 ring-red-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-serif font-bold text-3xl text-stone-900 group-hover:text-red-700 transition-colors">
                    {rad.radical}
                  </span>
                  {rad.variants && rad.variants.length > 0 && (
                    <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                      {rad.variants.join(', ')}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-red-700">{rad.pinyin}</div>
                <div className="text-xs text-stone-600 font-medium line-clamp-1 mt-0.5">
                  {rad.meaningId}
                </div>

                <div className="mt-2 pt-1.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center gap-1">
                  <span>{rad.strokeCount} Goresan</span>
                  <span className="text-stone-300">&bull;</span>
                  <span>{rad.examples.slice(0, 3).join(' ')}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Radical Writing & Details Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Latihan Radikal</div>
              <div className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <span>{selectedRadical.radical}</span>
                <span className="text-sm font-normal text-red-700 font-sans">{selectedRadical.pinyin}</span>
                <button
                  onClick={() => speechManager.speak(selectedRadical.radical)}
                  className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg font-medium">
              {selectedRadical.strokeCount} Goresan
            </span>
          </div>

          {/* Meaning Description */}
          <div className="w-full bg-stone-50 p-3 rounded-2xl mb-4 text-xs text-stone-700 border border-stone-100">
            <span className="font-semibold text-stone-900">Makna: </span>
            {selectedRadical.meaningId}
            {selectedRadical.variants && selectedRadical.variants.length > 0 && (
              <div className="mt-1 text-stone-500">
                <span className="font-medium text-stone-700">Bentuk variasi: </span>
                {selectedRadical.variants.join(', ')} (biasanya di samping karakter)
              </div>
            )}
          </div>

          {/* Interactive Writing Canvas */}
          <HanziWriterCanvas
            text={selectedRadical.radical}
            pinyin={selectedRadical.pinyin}
            meaning={selectedRadical.meaningId}
            size={250}
          />

          {/* Examples of characters using this radical */}
          <div className="w-full mt-5 pt-4 border-t border-stone-100">
            <div className="text-xs font-semibold text-stone-500 mb-2">Contoh Hanzi yang menggunakan radikal ini:</div>
            <div className="flex flex-wrap gap-2">
              {selectedRadical.examples.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => speechManager.speak(char)}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 border border-stone-200 text-lg font-serif font-bold text-stone-800 transition flex items-center justify-center shadow-xs"
                  title={`Klik dengar pelafalan ${char}`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
