import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CHARACTER_STORIES } from '../data/characterStories';
import type { CharacterStory } from '../types';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { speechManager } from '../utils/speech';
import { 
  Volume2, 
  BookOpen, 
  Layers, 
  Lightbulb, 
  Search, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';

export const CharacterStoriesView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<CharacterStory>(CHARACTER_STORIES[0]);
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tags = ['Semua', 'Alam', 'Orang', 'Tumbuhan', 'Elemen', 'Aktivitas', 'Waktu'];

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

  // Current index for prev/next navigation
  const currentIndex = useMemo(() => {
    return CHARACTER_STORIES.findIndex(s => s.id === selectedStory.id);
  }, [selectedStory]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = CHARACTER_STORIES[currentIndex - 1];
      setSelectedStory(prev);
      speechManager.speak(prev.character);
    }
  };

  const handleNext = () => {
    if (currentIndex < CHARACTER_STORIES.length - 1) {
      const next = CHARACTER_STORIES[currentIndex + 1];
      setSelectedStory(next);
      speechManager.speak(next.character);
    }
  };

  // Filtered stories in dropdown
  const filteredStories = useMemo(() => {
    let list = CHARACTER_STORIES;
    if (selectedTag !== 'Semua') {
      list = list.filter(s => s.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.character.includes(q) ||
        s.pinyin.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedTag, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in">
      {/* 1. TOP SELECTOR BAR WITH CUSTOM DROPDOWN & PREV/NEXT */}
      <div ref={dropdownRef} className="relative z-30">
        <div className="flex items-center gap-2">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95 flex-shrink-0"
            title="Aksara sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Custom Dropdown Trigger */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex-1 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl shadow-xs transition flex items-center justify-between min-w-0 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 flex-shrink-0">
                {selectedStory.character}
              </span>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">{selectedStory.pinyin}</span>
                  <span className="text-[10px] bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-semibold px-2 py-0.2 rounded-full border border-red-200/50 dark:border-red-900/50 hidden min-[400px]:inline">
                    {selectedStory.type.split(' ')[0]}
                  </span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate font-medium">
                  {selectedStory.meaning}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                {currentIndex + 1} / {CHARACTER_STORIES.length}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-red-600 dark:text-red-400' : ''
                }`} 
              />
            </div>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === CHARACTER_STORIES.length - 1}
            className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95 flex-shrink-0"
            title="Aksara berikutnya"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Dropdown Popover */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[420px] animate-in fade-in zoom-in-95 duration-150">
            {/* Search Header */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 sticky top-0 z-10 backdrop-blur-xs space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari aksara, pinyin, atau arti..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 shadow-2xs"
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

              {/* Tag filters pill bar inside dropdown */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                      selectedTag === tag
                        ? 'bg-red-700 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Characters in Dropdown */}
            <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-stone-100 dark:divide-stone-800 text-xs p-1">
              {filteredStories.length > 0 ? (
                filteredStories.map((item) => {
                  const isSelected = selectedStory.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedStory(item);
                        speechManager.speak(item.character);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-bold' 
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100 w-8 text-center flex-shrink-0">
                          {item.character}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-700 dark:text-red-400 text-xs">{item.pinyin}</span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal truncate">
                              {item.pictogramOrigin.split('(')[0]}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                            {item.meaning}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-stone-400 dark:text-stone-500 text-xs">
                  Tidak ada aksara yang sesuai dengan &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN CHARACTER CARD WITH PROMINENT WRITING CANVAS RIGHT AT TOP */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 sm:p-6 space-y-5 transition-colors">
        {/* Character Title, Pinyin, Audio & Pictogram Origin */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-900/50">
                {selectedStory.type}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">HSK 1 Piktogram</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {selectedStory.character}
              </h2>
              <div className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 font-sans">
                {selectedStory.pinyin}
              </div>
              <button
                onClick={() => speechManager.speak(selectedStory.character)}
                className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition active:scale-95"
                title="Dengarkan pelafalan"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-stone-800 dark:text-stone-200 font-semibold text-sm sm:text-base mt-0.5">
              {selectedStory.meaning}
            </div>
          </div>

          {/* Pictogram ancient shape preview */}
          <div className="bg-amber-50 dark:bg-stone-800/80 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-2.5 sm:p-3 text-center flex-shrink-0 max-w-[140px]">
            <div className="text-[10px] font-bold text-amber-900 dark:text-amber-400 flex items-center justify-center gap-1 mb-0.5">
              <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Bentuk Purba</span>
            </div>
            <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {selectedStory.pictogramOrigin.split('(')[0]}
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE WRITING CANVAS (PROMINENT RIGHT IN VIEW!) */}
        <div className="py-1 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Kanvas Animasi & Latihan Tulis:
          </div>
          <HanziWriterCanvas
            text={selectedStory.character}
            pinyin={selectedStory.pinyin}
            meaning={selectedStory.meaning}
            size={220}
          />
        </div>

        {/* 4. KISAH & LOGIKA FILOSOFI AKSARA */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Kisah & Logika Huruf:</span>
          </h4>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3.5 sm:p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
            {selectedStory.story}
          </p>
        </div>

        {/* 5. KOMPONEN PENYUSUN (IF COMPOSITE) */}
        {selectedStory.components && selectedStory.components.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Penyusun Karakter (Kombinasi Logika):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedStory.components.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-700 text-xs">
                  <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 w-7 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-2xs flex-shrink-0">
                    {comp.char}
                  </span>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">{comp.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CONTOH KATA DERIVATIF */}
        {selectedStory.sampleWords && selectedStory.sampleWords.length > 0 && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
            <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Contoh Kata yang Memakai Huruf Ini:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedStory.sampleWords.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => speechManager.speak(item.word)}
                  className="p-2.5 bg-stone-50 dark:bg-stone-800/70 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-900/50 border border-stone-100 dark:border-stone-700 rounded-2xl text-left transition group active:scale-98"
                >
                  <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition">
                    {item.word}
                  </div>
                  <div className="text-xs font-semibold text-red-700 dark:text-red-400">{item.pinyin}</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{item.meaning}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
