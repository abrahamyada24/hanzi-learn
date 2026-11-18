import type { MasteryStatus } from '../../types';

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';

export const STATUS_LABEL: Record<MasteryStatus, string> = {
  new: 'Baru',
  learning: 'Belajar',
  mastered: 'Hafal'
};
