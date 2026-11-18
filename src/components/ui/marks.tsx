import React from 'react';
import type { MasteryStatus } from '../../types';
import { focusRing, STATUS_LABEL } from './tokens';

/** Hand-drawn speaker mark: thin strokes, square caps, inherits currentColor. */
export const AudioIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className={className} aria-hidden>
    <path d="M3 9.5h4l5-4v13l-5-4H3z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </svg>
);

/** Bookmark ribbon: outline when off, solid vermilion when on. */
export const BookmarkIcon: React.FC<{ active: boolean; className?: string }> = ({ active, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinejoin="miter" className={className} aria-hidden
    fill={active ? 'var(--vermilion)' : 'none'} stroke={active ? 'var(--vermilion)' : 'currentColor'}>
    <path d="M6 3h12v18l-6-4.5L6 21z" />
  </svg>
);

/** Small swatch: empty = new, hatched = learning, solid = mastered. */
export const StatusSwatch: React.FC<{ status: MasteryStatus }> = ({ status }) => (
  <span
    aria-hidden
    className={`inline-block h-2.5 w-4 border ${
      status === 'mastered' ? 'bg-ink border-ink' : status === 'learning' ? 'hatch border-vermilion' : 'border-muted'
    }`}
  />
);

export const AudioButton: React.FC<{ onClick: (e: React.MouseEvent) => void; label?: string; className?: string; iconClass?: string }> = ({
  onClick,
  label = 'Dengarkan pelafalan',
  className = '',
  iconClass
}) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`text-ink hover:text-vermilion transition-colors ${focusRing} ${className}`}
  >
    <AudioIcon className={iconClass} />
  </button>
);

/** Three-way segmented switch: Baru / Belajar / Hafal. */
export const StatusSwitch: React.FC<{ status: MasteryStatus; onChange: (s: MasteryStatus) => void; className?: string }> = ({
  status,
  onChange,
  className = ''
}) => (
  <div role="group" aria-label="Status hafalan" className={`grid grid-cols-3 border border-ink divide-x divide-ink ${className}`}>
    {(['new', 'learning', 'mastered'] as MasteryStatus[]).map(s => {
      const active = status === s;
      const tone =
        active && s === 'mastered'
          ? 'bg-ink text-paper font-semibold'
          : active && s === 'learning'
          ? 'bg-paper-2 text-vermilion font-semibold'
          : active
          ? 'bg-paper-2 text-ink font-semibold'
          : 'text-muted hover:text-ink';
      return (
        <button
          key={s}
          onClick={() => onChange(s)}
          aria-pressed={active}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${tone}`}
        >
          {s === 'learning' && <StatusSwatch status="learning" />}
          {STATUS_LABEL[s]}
        </button>
      );
    })}
  </div>
);
