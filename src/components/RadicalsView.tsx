import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RADICALS_DATA } from '../data/radicals';
import type { RadicalItem } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { 
  Volume2, 
  Search, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Layers
} from 'lucide-react';

export const RadicalsView: React.FC = () => {
  const [selectedRadical, setSelectedRadical] = useState<RadicalItem>(RADICALS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const currentIndex = useMemo(() => {
    return RADICALS_DATA.findIndex(r => r.id === selectedRadical.id);
  }, [selectedRadical]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = RADICALS_DATA[currentIndex - 1];
      setSelectedRadical(prev);
      speechManager.speak(prev.radical);
    }
  };

  const handleNext = () => {
    if (currentIndex < RADICALS_DATA.length - 1) {
      const next = RADICALS_DATA[currentIndex + 1];
      setSelectedRadical(next);
      speechManager.speak(next.radical);
    }
  };

  const filteredRadicals = useMemo(() => {
    if (!searchQuery.trim()) return RADICALS_DATA;
    const q = searchQuery.toLowerCase().trim();
    return RADICALS_DATA.filter(r => 
      r.radical.includes(q) ||
      r.pinyin.toLowerCase().includes(q) ||
      r.meaningId.toLowerCase().includes(q) ||
      r.examples.some(e => e.includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in">
      {/* 1. TOP SELECTOR BAR WITH COMPACT DROPDOWN & PREV/NEXT */}
      <div ref={dropdownRef} className="relative z-30">
        <div className="flex items-center gap-2">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95 flex-shrink-0"
            title="Radikal sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dropdown Trigger Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex-1 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl shadow-xs transition flex items-center justify-between min-w-0 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 flex-shrink-0">
                {selectedRadical.radical}
              </span>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">{selectedRadical.pinyin}</span>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold px-2 py-0.2 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                    {selectedRadical.strokeCount} Goresan
                  </span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate font-medium">
                  {selectedRadical.meaningId}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                {currentIndex + 1} / {RADICALS_DATA.length}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`} 
              />
            </div>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === RADICALS_DATA.length - 1}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95 flex-shrink-0"
            title="Radikal berikutnya"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Dropdown Popover */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px] animate-in fade-in zoom-in-95 duration-150">
            {/* Search Header */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 sticky top-0 z-10 backdrop-blur-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari radikal, pinyin, atau arti (air, orang, dll)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of 16 Radicals */}
            <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-stone-100 dark:divide-stone-800 text-xs p-1">
              {filteredRadicals.length > 0 ? (
                filteredRadicals.map((rad) => {
                  const isSelected = selectedRadical.id === rad.id;
                  return (
                    <button
                      key={rad.id}
                      onClick={() => {
                        setSelectedRadical(rad);
                        speechManager.speak(rad.radical);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold' 
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100 w-8 text-center flex-shrink-0">
                          {rad.radical}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">{rad.pinyin}</span>
                            {rad.variants && rad.variants.length > 0 && (
                              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                                ({rad.variants.join(', ')})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                            {rad.meaningId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {rad.strokeCount} gores
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-1" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-stone-400 dark:text-stone-500 text-xs">
                  Tidak ada radikal yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. RADICAL DETAILS & PROMINENT WRITING CANVAS */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 sm:p-6 space-y-5 transition-colors">
        {/* Header Details */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                Radikal Kunci (部首)
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                {selectedRadical.strokeCount} Goresan
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {selectedRadical.radical}
              </h2>
              <div className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400 font-sans">
                {selectedRadical.pinyin}
              </div>
              <button
                onClick={() => speechManager.speak(selectedRadical.radical)}
                className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition active:scale-95"
                title="Dengarkan pelafalan"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-stone-800 dark:text-stone-200 font-semibold text-sm sm:text-base mt-0.5">
              {selectedRadical.meaningId}
            </div>
          </div>

          {/* Variants pill */}
          {selectedRadical.variants && selectedRadical.variants.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-2.5 sm:p-3 text-center flex-shrink-0">
              <div className="text-[10px] font-bold text-blue-900 dark:text-blue-400 mb-0.5">
                Variasi Bentuk
              </div>
              <div className="text-base font-serif font-bold text-blue-800 dark:text-blue-300">
                {selectedRadical.variants.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* 3. INTERACTIVE WRITING CANVAS (PROMINENT AT TOP) */}
        <div className="py-1 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Kanvas Animasi & Latihan Tulis Radikal:
          </div>
          <HanziWriterCanvas
            text={selectedRadical.radical}
            pinyin={selectedRadical.pinyin}
            meaning={selectedRadical.meaningId}
            size={220}
          />
        </div>

        {/* 4. CONTOH KARAKTER DENGAN RADIKAL INI */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Contoh Karakter yang Mengandung Radikal Ini:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedRadical.examples.map((char, idx) => (
              <button
                key={idx}
                onClick={() => speechManager.speak(char)}
                className="py-2 px-3 bg-stone-50 dark:bg-stone-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900/50 border border-stone-100 dark:border-stone-700 rounded-xl transition flex items-center gap-1.5 active:scale-95 group"
              >
                <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                  {char}
                </span>
                <Volume2 className="w-3 h-3 text-stone-300 dark:text-stone-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
