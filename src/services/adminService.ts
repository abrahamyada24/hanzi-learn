import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { HSK1_VOCABULARY } from '../data/hsk1';
import { getFeedbackList } from './feedbackService';
import type { FeedbackData } from './feedbackService';

export const ADMIN_EMAILS = [
  'abrahamyadaa24@gmail.com',
  'abrahamyada24@gmail.com',
  'bram.simrs@gmail.com'
];

export interface AdminUserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  streakDays: number;
  charactersWritten: number;
  quizzesTaken: number;
  correctAnswers: number;
  masteredCount: number;
  learningCount: number;
  lastActiveDate: string;
  lastSynced: string;
}

export interface WordMetric {
  id: string;
  hanzi: string;
  pinyin: string;
  indonesian: string;
  count: number;
}

export interface AdminAnalyticsData {
  totalUsers: number;
  activeUsers7Days: number;
  totalCharactersWritten: number;
  totalQuizzesTaken: number;
  averageAccuracy: number;
  averageStreak: number;
  users: AdminUserRecord[];
  mostMasteredWords: WordMetric[];
  mostStruggledWords: WordMetric[];
  feedbackList: FeedbackData[];
  feedbackStats: {
    total: number;
    newCount: number;
    averageRating: number;
    byCategory: Record<string, number>;
  };
}

/**
 * Fetch and compute complete analytics across Firestore collections
 */
export async function fetchAdminAnalytics(): Promise<AdminAnalyticsData> {
  const usersCol = collection(db, 'users');
  const usersSnap = await getDocs(usersCol);

  const wordMasteredTally: Record<string, number> = {};
  const wordStruggledTally: Record<string, number> = {};

  let sumCharactersWritten = 0;
  let sumQuizzesTaken = 0;
  let sumCorrectAnswers = 0;
  let sumStreak = 0;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  let activeUsers7Days = 0;

  const users: AdminUserRecord[] = [];

  usersSnap.forEach(docSnap => {
    const data = docSnap.data();
    const stats = data.stats || {};
    const progress = data.progress || {};

    let userMastered = 0;
    let userLearning = 0;

    Object.entries(progress).forEach(([wordId, p]: [string, any]) => {
      const status = p?.status;
      if (status === 'mastered') {
        userMastered++;
        wordMasteredTally[wordId] = (wordMasteredTally[wordId] || 0) + 1;
      } else if (status === 'learning' || status === 'new') {
        userLearning++;
        if (p?.reviewCount > 1 || status === 'new') {
          wordStruggledTally[wordId] = (wordStruggledTally[wordId] || 0) + 1;
        }
      }
    });

    const charactersWritten = stats.charactersWritten || 0;
    const quizzesTaken = stats.totalQuizzesTaken || 0;
    const correctAnswers = stats.correctQuizAnswers || 0;
    const streakDays = stats.streakDays || 1;
    const lastActiveDate = stats.lastActiveDate || data.lastSynced || '-';

    sumCharactersWritten += charactersWritten;
    sumQuizzesTaken += quizzesTaken;
    sumCorrectAnswers += correctAnswers;
    sumStreak += streakDays;

    if (stats.lastActiveDate) {
      const activeDate = new Date(stats.lastActiveDate);
      if (!isNaN(activeDate.getTime()) && activeDate >= sevenDaysAgo) {
        activeUsers7Days++;
      }
    }

    users.push({
      uid: docSnap.id,
      email: data.email || null,
      displayName: data.displayName || 'Pengguna Tanpa Nama',
      streakDays,
      charactersWritten,
      quizzesTaken,
      correctAnswers,
      masteredCount: userMastered,
      learningCount: userLearning,
      lastActiveDate,
      lastSynced: data.lastSynced || '-'
    });
  });

  // Sort users by last active / streak descending
  users.sort((a, b) => b.charactersWritten - a.charactersWritten || b.streakDays - a.streakDays);

  const totalUsers = users.length;
  const averageStreak = totalUsers > 0 ? Math.round((sumStreak / totalUsers) * 10) / 10 : 0;
  const averageAccuracy = sumQuizzesTaken > 0 ? Math.round((sumCorrectAnswers / sumQuizzesTaken) * 100) : 0;

  // Map top mastered words
  const vocabMap = new Map(HSK1_VOCABULARY.map(v => [v.id, v]));

  const mostMasteredWords: WordMetric[] = Object.entries(wordMasteredTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([wordId, count]) => {
      const vocab = vocabMap.get(wordId);
      return {
        id: wordId,
        hanzi: vocab?.hanzi || wordId,
        pinyin: vocab?.pinyin || '',
        indonesian: vocab?.indonesian || '',
        count
      };
    });

  // Map top struggled words
  const mostStruggledWords: WordMetric[] = Object.entries(wordStruggledTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([wordId, count]) => {
      const vocab = vocabMap.get(wordId);
      return {
        id: wordId,
        hanzi: vocab?.hanzi || wordId,
        pinyin: vocab?.pinyin || '',
        indonesian: vocab?.indonesian || '',
        count
      };
    });

  // Fetch feedback
  const feedbackList = await getFeedbackList(100);
  let feedbackSumRating = 0;
  let newFeedbackCount = 0;
  const byCategory: Record<string, number> = {};

  feedbackList.forEach(fb => {
    feedbackSumRating += fb.rating || 5;
    if (fb.status === 'new') newFeedbackCount++;
    byCategory[fb.category] = (byCategory[fb.category] || 0) + 1;
  });

  const feedbackTotal = feedbackList.length;
  const averageRating = feedbackTotal > 0 ? Math.round((feedbackSumRating / feedbackTotal) * 10) / 10 : 5.0;

  return {
    totalUsers,
    activeUsers7Days,
    totalCharactersWritten: sumCharactersWritten,
    totalQuizzesTaken: sumQuizzesTaken,
    averageAccuracy,
    averageStreak,
    users,
    mostMasteredWords,
    mostStruggledWords,
    feedbackList,
    feedbackStats: {
      total: feedbackTotal,
      newCount: newFeedbackCount,
      averageRating,
      byCategory
    }
  };
}

/**
 * Check if a given email or session has admin privilege
 */
export function checkIsAdmin(email?: string | null): boolean {
  if (!email) {
    // Check if session pin unlocked
    return sessionStorage.getItem('hanzilearn_admin_unlocked') === 'true';
  }
  const cleanEmail = email.toLowerCase().trim();
  const emailMatched = ADMIN_EMAILS.some(adm => adm.toLowerCase().trim() === cleanEmail);
  return emailMatched || sessionStorage.getItem('hanzilearn_admin_unlocked') === 'true';
}
