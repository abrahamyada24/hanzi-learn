import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check, BookOpen } from 'lucide-react';
import { LESSON_UNITS } from '../data/lessonUnits';
import { HSK1_VOCABULARY } from '../data/hsk1';
import type { LessonUnit, VocabItem } from '../types';

interface UnitSelectorDropdownProps {
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  onSelectWord?: (word: VocabItem) => void;
  className?: string;
}

export const UnitSelectorDropdown: React.FC<UnitSelectorDropdownProps> = ({
  selectedUnitId,
  onSelectUnit,
  onSelectWord,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentUnit = LESSON_UNITS.find(u => u.id === selectedUnitId);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close (handles touchstart on mobile & mousedown on desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Map each word to its lesson unit
  const wordUnitMap = useMemo(() => {
    const map = new Map<string, LessonUnit>();
    LESSON_UNITS.forEach(unit => {
      unit.wordIds.forEach(id => {
        map.set(id, unit);
      });
    });
    return map;
  }, []);

  // Filter units and vocabulary based on search query
  const { matchingUnits, matchingWords } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { matchingUnits: LESSON_UNITS, matchingWords: [] };
    }

    // Matching units: by title, subtitle, or unit number (e.g. "bab 1", "angka", "salam")
    const units = LESSON_UNITS.filter(unit => {
      const matchTitle = unit.title.toLowerCase().includes(query);
      const matchSubtitle = unit.subtitle.toLowerCase().includes(query);
      const matchNumber = unit.unitNumber.toString() === query || `bab ${unit.unitNumber}`.includes(query);
      return matchTitle || matchSubtitle || matchNumber;
    });

    // Matching words: by Hanzi, Pinyin, Indonesian translation, or English
    const words = HSK1_VOCABULARY.filter(item => {
      const matchHanzi = item.hanzi.includes(query);
      const matchPinyin = item.pinyin.toLowerCase().includes(query);
      const matchIndo = item.indonesian.toLowerCase().includes(query);
      const matchEng = item.english.toLowerCase().includes(query);
      return matchHanzi || matchPinyin || matchIndo || matchEng;
    });

    return { matchingUnits: units, matchingWords: words };
  }, [searchQuery]);

  const handleSelectUnit = (unitId: string) => {
    onSelectUnit(unitId);
    setIsOpen(false);
  };

  const handleSelectWord = (word: VocabItem) => {
    const unit = wordUnitMap.get(word.id);
    if (unit) {
      onSelectUnit(unit.id);
    }
    if (onSelectWord) {
      onSelectWord(word);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold py-2.5 px-3.5 rounded-2xl flex items-center justify-between shadow-xs transition active:scale-[0.99]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="text-base flex-shrink-0">
            {currentUnit ? currentUnit.icon : '📚'}
          </span>
          <span className="truncate text-stone-800 dark:text-stone-100 font-bold">
            {currentUnit ? currentUnit.title : 'Semua Bab (130 Kata)'}
          </span>
          {currentUnit && (
            <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap hidden min-[360px]:inline">
              {currentUnit.wordIds.length} kata
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-stone-500 dark:text-stone-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-red-600 dark:text-red-400' : ''
          }`} 
        />
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 sticky top-0 z-10 backdrop-blur-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bab atau kosakata (Hanzi, Pinyin, arti)..."
                className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full transition"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {/* If NO search query: Show 'Semua Bab' and 10 Units */}
            {!searchQuery.trim() && (
              <div>
                {/* Option: Semua Bab */}
                <button
                  type="button"
                  onClick={() => handleSelectUnit('all')}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition ${
                    selectedUnitId === 'all' 
                      ? 'bg-red-50/80 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-bold' 
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">📚</span>
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">Semua Bab &middot; 130 Kata HSK 1</div>
                      <div className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">Belajar seluruh kosakata HSK 1</div>
                    </div>
                  </div>
                  {selectedUnitId === 'all' && (
                    <Check className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 ml-2" />
                  )}
                </button>

                {/* Section title */}
                <div className="px-3.5 py-1.5 bg-stone-50 dark:bg-stone-800 text-[10px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider">
                  Daftar 10 Bab Terstruktur
                </div>

                {/* Units List */}
                {LESSON_UNITS.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => handleSelectUnit(unit.id)}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition ${
                        isSelected 
                          ? 'bg-red-50/80 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-bold' 
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="text-base flex-shrink-0">{unit.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 dark:text-stone-100 truncate">{unit.title}</div>
                          <div className="text-[10px] text-stone-400 dark:text-stone-500 font-normal truncate">{unit.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full font-medium">
                          {unit.wordIds.length} kata
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-red-600 dark:text-red-400 ml-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* If SEARCH QUERY active: Show matching Babs and matching Words */}
            {searchQuery.trim() && (
              <>
                {/* 1. MATCHING BAB / UNITS */}
                {matchingUnits.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1.5 bg-stone-50 dark:bg-stone-800 text-[10px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Bab yang Cocok</span>
                      <span className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                        {matchingUnits.length}
                      </span>
                    </div>
                    {matchingUnits.map((unit) => {
                      const isSelected = selectedUnitId === unit.id;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => handleSelectUnit(unit.id)}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition ${
                            isSelected ? 'bg-red-50/80 dark:bg-red-950/50 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{unit.icon}</span>
                            <div className="truncate font-semibold text-stone-900 dark:text-stone-100">{unit.title}</div>
                          </div>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal">
                            {unit.wordIds.length} kata
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. MATCHING VOCABULARY WORDS */}
                {matchingWords.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1.5 bg-stone-50 dark:bg-stone-800 text-[10px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Kosakata yang Cocok</span>
                      <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                        {matchingWords.length} kata
                      </span>
                    </div>
                    {matchingWords.map((word) => {
                      const unit = wordUnitMap.get(word.id);
                      return (
                        <button
                          key={word.id}
                          type="button"
                          onClick={() => handleSelectWord(word)}
                          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-red-50/50 dark:hover:bg-red-950/30 transition group"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 text-center font-bold text-base text-stone-900 dark:text-stone-100 flex-shrink-0 group-hover:text-red-700 dark:group-hover:text-red-400">
                              {word.hanzi}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-red-700 dark:text-red-400 text-xs">{word.pinyin}</span>
                              </div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {word.indonesian}
                              </div>
                            </div>
                          </div>
                          {unit && (
                            <span className="text-[9px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                              <span>{unit.icon}</span>
                              <span>Bab {unit.unitNumber}</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. EMPTY STATE */}
                {matchingUnits.length === 0 && matchingWords.length === 0 && (
                  <div className="p-6 text-center text-stone-400 dark:text-stone-500">
                    <BookOpen className="w-6 h-6 mx-auto mb-1 text-stone-300 dark:text-stone-600" />
                    <p className="font-medium text-stone-600 dark:text-stone-300 text-xs">Tidak ditemukan</p>
                    <p className="text-[10px] mt-0.5 text-stone-400 dark:text-stone-500">
                      Tidak ada bab atau kosakata yang cocok dengan &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
