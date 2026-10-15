import React, { useState } from 'react';
import { CHARACTER_STORIES } from '../data/characterStories';
import type { CharacterStory } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { Volume2, BookOpen, Layers, Lightbulb, Compass } from 'lucide-react';

export const CharacterStoriesView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<CharacterStory>(CHARACTER_STORIES[0]);
  const [selectedTag, setSelectedTag] = useState<string>('Semua');

  const tags = ['Semua', 'Alam', 'Orang', 'Tumbuhan', 'Elemen', 'Aktivitas', 'Waktu'];

  const filteredStories = selectedTag === 'Semua'
    ? CHARACTER_STORIES
    : CHARACTER_STORIES.filter(s => s.tags.includes(selectedTag));

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 rounded-3xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
              <span>Rahasia Aksara Hanzi: Piktogram & Logika Huruf (字与起源)</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Hanzi bukanlah coretan hafalan buta! Sejak ribuan tahun lalu di Tiongkok kuno, aksara ini diciptakan dari 
              <strong> lukisan alam nyata</strong> (piktogram) dan <strong>asosiasi logika</strong>. Mengetahui cerita di balik tiap huruf membuat hafalan menempel alami di otak.
            </p>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-3 border-t border-amber-200/50 text-xs">
          <span className="text-stone-400 font-medium mr-1 flex-shrink-0">Kategori:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all font-medium ${
                selectedTag === tag
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white/80 text-stone-600 hover:bg-white border border-amber-200/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Characters */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredStories.map((item) => {
            const isSelected = selectedStory.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedStory(item);
                  speechManager.speak(item.character);
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-red-50 border-red-500 shadow-sm ring-2 ring-red-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-serif font-bold text-3xl text-stone-900 group-hover:text-red-700 transition">
                    {item.character}
                  </span>
                  <span className="text-xs font-semibold text-red-700">
                    {item.pinyin}
                  </span>
                </div>
                <div className="text-xs font-medium text-stone-600 truncate mt-1">
                  {item.meaning.split('/')[0]}
                </div>
                <div className="text-[10px] text-stone-400 truncate mt-0.5">
                  {item.pictogramOrigin.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Character Deep Story & Writing Canvas */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
          {/* Header Character Card */}
          <div className="flex items-start justify-between pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                  {selectedStory.type}
                </span>
                <span className="text-xs text-stone-400 font-mono">HSK Dasar</span>
              </div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-serif font-bold text-stone-900">
                  {selectedStory.character}
                </h2>
                <div className="text-xl font-bold text-red-700 font-sans">
                  {selectedStory.pinyin}
                </div>
                <button
                  onClick={() => speechManager.speak(selectedStory.character)}
                  className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                  title="Dengarkan pelafalan"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="text-stone-800 font-semibold text-base mt-1">
                {selectedStory.meaning}
              </div>
            </div>
          </div>

          {/* Pictogram Origin Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Bentuk Asli Piktogram:</span>
            </div>
            <p className="text-xs text-stone-800 font-medium">
              {selectedStory.pictogramOrigin}
            </p>
          </div>

          {/* Mnemonic Story */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-red-600" />
              <span>Kisah & Logika Huruf:</span>
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
              {selectedStory.story}
            </p>
          </div>

          {/* Components breakdown (if composite character) */}
          {selectedStory.components && selectedStory.components.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Penyusun Karakter (Kombinasi Logika):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedStory.components.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                    <span className="font-serif font-bold text-xl text-stone-900 w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-xs">
                      {comp.char}
                    </span>
                    <span className="text-stone-700 font-medium">{comp.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Writing Canvas */}
          <div className="pt-2 border-t border-stone-100 flex flex-col items-center">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Latihan Tulis Karakter Ini:
            </h4>
            <HanziWriterCanvas
              text={selectedStory.character}
              pinyin={selectedStory.pinyin}
              meaning={selectedStory.meaning}
              size={260}
            />
          </div>

          {/* Derivative Words (Contoh Kata yang Memakai Huruf Ini) */}
          {selectedStory.sampleWords && selectedStory.sampleWords.length > 0 && (
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Contoh Kata yang Menggunakan Karakter Ini:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedStory.sampleWords.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => speechManager.speak(item.word)}
                    className="p-3 bg-stone-50 hover:bg-red-50 hover:border-red-200 border border-stone-100 rounded-2xl text-left transition group"
                  >
                    <div className="font-serif font-bold text-lg text-stone-900 group-hover:text-red-700 transition">
                      {item.word}
                    </div>
                    <div className="text-xs font-semibold text-red-700">{item.pinyin}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-1">{item.meaning}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
