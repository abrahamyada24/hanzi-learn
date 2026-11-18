import React, { useState, useRef, useEffect, useMemo } from 'react';
import { focusRing } from './ui/tokens';
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

  const pad = (n: number) => String(n).padStart(2, '0');
  const strip = (t: string) => t.replace(/^Bab\s*\d+\s*:\s*/i, '');
  const rowBase = 'w-full px-3.5 py-3 text-left flex items-center gap-3 hover:bg-paper-2 transition-colors';
  const groupLabel = 'px-3.5 py-2 bg-paper-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted flex items-center justify-between border-y border-ink/20';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border border-ink text-ink text-sm py-3 px-3.5 flex items-center justify-between transition-colors ${focusRing}`}
        aria-expanded={isOpen}
      >
        <span className="flex items-baseline gap-3 min-w-0 pr-2">
          <span className="text-vermilion font-semibold tabular-nums">
            {currentUnit ? pad(currentUnit.unitNumber) : '—'}
          </span>
          <span className="truncate font-semibold">{currentUnit ? strip(currentUnit.title) : 'Semua bab'}</span>
          <span className="text-xs text-muted whitespace-nowrap hidden min-[360px]:inline">
            {currentUnit ? currentUnit.wordIds.length : 130} kata
          </span>
        </span>
        <span aria-hidden className="text-xs">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full -mt-px bg-paper border border-ink z-50 flex flex-col max-h-[380px] animate-in fade-in duration-150">
          <div className="p-3 border-b border-ink">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bab atau kata (Hanzi, pinyin, arti)"
                aria-label="Cari bab atau kosakata"
                className="w-full bg-transparent border-b border-ink pb-1.5 pr-14 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-0 text-xs text-muted hover:text-ink"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto overscroll-contain flex-1 text-sm divide-y divide-ink/15">
            {!searchQuery.trim() && (
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectUnit('all')}
                  className={`${rowBase} ${selectedUnitId === 'all' ? 'bg-paper-2' : ''}`}
                >
                  <span className="w-6 text-vermilion font-semibold">{selectedUnitId === 'all' ? '●' : ''}</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">Semua bab</span>
                    <span className="block text-xs text-muted">130 kata HSK 1</span>
                  </span>
                </button>

                <div className={groupLabel}>10 bab terstruktur</div>

                {LESSON_UNITS.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => handleSelectUnit(unit.id)}
                      className={`${rowBase} ${isSelected ? 'bg-paper-2' : ''}`}
                    >
                      <span className={`w-6 font-semibold tabular-nums ${isSelected ? 'text-vermilion' : 'text-muted'}`}>{pad(unit.unitNumber)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-ink truncate">{strip(unit.title)}</span>
                        <span className="block text-xs text-muted truncate">{unit.subtitle}</span>
                      </span>
                      <span className="text-xs text-muted whitespace-nowrap">{unit.wordIds.length} kata</span>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery.trim() && (
              <>
                {matchingUnits.length > 0 && (
                  <div>
                    <div className={groupLabel}>
                      <span>Bab yang cocok</span>
                      <span>{matchingUnits.length}</span>
                    </div>
                    {matchingUnits.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => handleSelectUnit(unit.id)}
                        className={`${rowBase} ${selectedUnitId === unit.id ? 'bg-paper-2' : ''}`}
                      >
                        <span className="w-6 text-muted font-semibold tabular-nums">{pad(unit.unitNumber)}</span>
                        <span className="flex-1 truncate font-semibold text-ink">{strip(unit.title)}</span>
                        <span className="text-xs text-muted">{unit.wordIds.length} kata</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingWords.length > 0 && (
                  <div>
                    <div className={groupLabel}>
                      <span>Kosakata yang cocok</span>
                      <span>{matchingWords.length} kata</span>
                    </div>
                    {matchingWords.map((word) => {
                      const unit = wordUnitMap.get(word.id);
                      return (
                        <button
                          key={word.id}
                          type="button"
                          onClick={() => handleSelectWord(word)}
                          className={`${rowBase} group`}
                        >
                          <span className="w-10 text-center font-serif font-black text-2xl text-ink group-hover:text-vermilion">{word.hanzi}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-vermilion">{word.pinyin}</span>
                            <span className="block text-xs text-muted truncate">{word.indonesian}</span>
                          </span>
                          {unit && <span className="text-xs text-muted whitespace-nowrap">Bab {pad(unit.unitNumber)}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {matchingUnits.length === 0 && matchingWords.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-ink">Tidak ditemukan</p>
                    <p className="text-xs mt-1 text-muted">
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
