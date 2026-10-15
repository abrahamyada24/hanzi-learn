import type { WordProgress, UserStats, MasteryStatus } from '../types';

const PROGRESS_KEY = 'mandarin_hsk_progress';
const STATS_KEY = 'mandarin_hsk_stats';
const BOOKMARKS_KEY = 'mandarin_hsk_bookmarks';

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getAllProgress(): Record<string, WordProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWordProgress(
  wordId: string,
  status: MasteryStatus,
  writeSuccessIncrement: number = 0,
  writeMistakeIncrement: number = 0
): WordProgress {
  const all = getAllProgress();
  const existing = all[wordId] || {
    wordId,
    status: 'new',
    writeSuccessCount: 0,
    writeMistakeCount: 0,
    lastReviewed: new Date().toISOString(),
    nextReviewDate: new Date().toISOString(),
    intervalDays: 1
  };

  const nextInterval = status === 'mastered' 
    ? Math.max(existing.intervalDays * 2.5, 4)
    : status === 'learning' 
    ? Math.max(existing.intervalDays * 1.2, 1)
    : 1;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.round(nextInterval));

  const updated: WordProgress = {
    ...existing,
    status,
    writeSuccessCount: existing.writeSuccessCount + writeSuccessIncrement,
    writeMistakeCount: existing.writeMistakeCount + writeMistakeIncrement,
    lastReviewed: new Date().toISOString(),
    nextReviewDate: nextDate.toISOString(),
    intervalDays: nextInterval
  };

  all[wordId] = updated;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save progress', e);
  }

  return updated;
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  return {
    streakDays: 1,
    lastActiveDate: getTodayDateString(),
    charactersWritten: 0,
    totalQuizzesTaken: 0,
    correctQuizAnswers: 0,
  };
}

export function recordActivity(charactersWrittenCount: number = 0, quizCorrect: number = 0, quizTotal: number = 0): UserStats {
  const stats = getUserStats();
  const today = getTodayDateString();

  let streak = stats.streakDays;
  if (stats.lastActiveDate !== today) {
    const lastDate = new Date(stats.lastActiveDate);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1; // streak maintained
    } else if (diffDays > 1) {
      streak = 1; // streak reset
    }
  }

  const updated: UserStats = {
    streakDays: streak,
    lastActiveDate: today,
    charactersWritten: stats.charactersWritten + charactersWrittenCount,
    totalQuizzesTaken: stats.totalQuizzesTaken + quizTotal,
    correctQuizAnswers: stats.correctQuizAnswers + quizCorrect,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save stats', e);
  }

  return updated;
}

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(wordId: string): string[] {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(wordId);
  let updated: string[];
  if (index >= 0) {
    updated = bookmarks.filter(id => id !== wordId);
  } else {
    updated = [...bookmarks, wordId];
  }
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
  return updated;
}
