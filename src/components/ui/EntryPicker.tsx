import React, { useState, useRef, useEffect, useMemo } from 'react';
import { focusRing } from './marks';

interface EntryPickerProps<T> {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  getId: (item: T) => string;
  glyph: (item: T) => string;
  primary: (item: T) => string; // pinyin
  secondary: (item: T) => string; // meaning
  meta?: (item: T) => string;
  matches: (item: T, query: string) => boolean;
  searchPlaceholder: string;
  prevLabel: string;
  nextLabel: string;
  emptyLabel: (query: string) => string;
  /** Optional extra row of filters rendered inside the popover (e.g. tags). */
  filterRow?: React.ReactNode;
  /** Applied before search (e.g. tag filter). */
  prefilter?: (item: T) => boolean;
}

/** Prev / dropdown / next picker shared by Asal-Usul and Radikal. */
export function EntryPicker<T>({
  items,
  selected,
  onSelect,
  getId,
  glyph,
  primary,
  secondary,
  meta,
  matches,
  searchPlaceholder,
  prevLabel,
  nextLabel,
  emptyLabel,
  filterRow,
  prefilter
}: EntryPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const outside = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('touchstart', outside);
      clearTimeout(t);
    };
  }, [open]);

  const index = useMemo(() => items.findIndex(i => getId(i) === getId(selected)), [items, selected, getId]);

  const visible = useMemo(() => {
    let list = prefilter ? items.filter(prefilter) : items;
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(i => matches(i, q));
    return list;
  }, [items, query, matches, prefilter]);

  const step = (d: number) => {
    const next = items[index + d];
    if (next) onSelect(next);
  };

  const navBtn = `border border-ink px-3 sm:px-4 text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:pointer-events-none ${focusRing}`;

  return (
    <div ref={rootRef} className="relative z-30">
      <div className="flex items-stretch gap-2">
        <button onClick={() => step(-1)} disabled={index <= 0} className={navBtn} title={prevLabel} aria-label={prevLabel}>
          <span aria-hidden>&larr;</span>
        </button>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`flex-1 min-w-0 border border-ink px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors ${focusRing}`}
        >
          <span className="flex items-center gap-4 min-w-0">
            <span className="font-serif font-black text-3xl leading-none text-ink flex-shrink-0">{glyph(selected)}</span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-vermilion">{primary(selected)}</span>
                {meta && <span className="text-[11px] text-muted hidden min-[400px]:inline">{meta(selected)}</span>}
              </span>
              <span className="block text-xs text-ink truncate">{secondary(selected)}</span>
            </span>
          </span>
          <span className="flex items-center gap-3 flex-shrink-0 text-xs text-muted tabular-nums">
            <span className="hidden sm:inline">
              <span className="text-ink font-semibold">{String(index + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}
            </span>
            <span aria-hidden className="text-ink">{open ? '−' : '+'}</span>
          </span>
        </button>

        <button onClick={() => step(1)} disabled={index >= items.length - 1} className={navBtn} title={nextLabel} aria-label={nextLabel}>
          <span aria-hidden>&rarr;</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full -mt-px bg-paper border border-ink flex flex-col max-h-[420px] animate-in fade-in duration-150">
          <div className="p-3 border-b border-ink space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full bg-transparent border-b border-ink pb-1.5 pr-14 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-vermilion"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-0 top-0 text-xs text-muted hover:text-ink">
                  Hapus
                </button>
              )}
            </div>
            {filterRow}
          </div>

          <ul className="overflow-y-auto overscroll-contain flex-1 divide-y divide-ink/15">
            {visible.length > 0 ? (
              visible.map(item => {
                const on = getId(item) === getId(selected);
                return (
                  <li key={getId(item)}>
                    <button
                      onClick={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                      className={`group relative w-full px-3.5 py-2.5 text-left flex items-center gap-4 transition-colors hover:bg-paper-2 ${on ? 'bg-paper-2' : ''}`}
                    >
                      {on && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-vermilion" />}
                      <span className="font-serif font-black text-2xl w-10 text-center text-ink group-hover:text-vermilion flex-shrink-0">{glyph(item)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-vermilion">{primary(item)}</span>
                          {meta && <span className="text-[11px] text-muted truncate">{meta(item)}</span>}
                        </span>
                        <span className="block text-xs text-muted truncate">{secondary(item)}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="p-6 text-center text-sm text-muted">{emptyLabel(query)}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
