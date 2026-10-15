import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WordProgress, UserStats } from '../types';

export interface UserCloudData {
  progress?: Record<string, WordProgress>;
  stats?: UserStats;
  bookmarks?: string[];
  lastSynced?: string;
  email?: string;
  displayName?: string;
}

/**
 * Sync user data between local storage and Firestore on login
 */
export async function syncUserData(
  uid: string,
  localProgress: Record<string, WordProgress>,
  localStats: UserStats,
  localBookmarks: string[],
  userInfo?: { email?: string | null; displayName?: string | null }
): Promise<{
  progress: Record<string, WordProgress>;
  stats: UserStats;
  bookmarks: string[];
}> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const cloudData = snap.data() as UserCloudData;

      // Merge progress (prefer cloud if exists, or merge keys)
      const mergedProgress = {
        ...localProgress,
        ...(cloudData.progress || {})
      };

      // Merge stats (take higher values)
      const cloudStats = cloudData.stats;
      const mergedStats: UserStats = {
        streakDays: Math.max(localStats.streakDays, cloudStats?.streakDays || 1),
        lastActiveDate: localStats.lastActiveDate,
        charactersWritten: Math.max(localStats.charactersWritten, cloudStats?.charactersWritten || 0),
        totalQuizzesTaken: Math.max(localStats.totalQuizzesTaken, cloudStats?.totalQuizzesTaken || 0),
        correctQuizAnswers: Math.max(localStats.correctQuizAnswers, cloudStats?.correctQuizAnswers || 0),
      };

      // Merge bookmarks (union of sets)
      const mergedBookmarks = Array.from(new Set([
        ...localBookmarks,
        ...(cloudData.bookmarks || [])
      ]));

      // Update cloud with merged result
      await setDoc(userDocRef, {
        progress: mergedProgress,
        stats: mergedStats,
        bookmarks: mergedBookmarks,
        lastSynced: new Date().toISOString(),
        email: userInfo?.email || cloudData.email || '',
        displayName: userInfo?.displayName || cloudData.displayName || ''
      }, { merge: true });

      return {
        progress: mergedProgress,
        stats: mergedStats,
        bookmarks: mergedBookmarks
      };
    } else {
      // First time login: upload existing local progress to cloud
      const initialCloudData: UserCloudData = {
        progress: localProgress,
        stats: localStats,
        bookmarks: localBookmarks,
        lastSynced: new Date().toISOString(),
        email: userInfo?.email || '',
        displayName: userInfo?.displayName || ''
      };

      await setDoc(userDocRef, initialCloudData);

      return {
        progress: localProgress,
        stats: localStats,
        bookmarks: localBookmarks
      };
    }
  } catch (error) {
    console.error('Cloud sync error, falling back to local data:', error);
    return {
      progress: localProgress,
      stats: localStats,
      bookmarks: localBookmarks
    };
  }
}

/**
 * Save updates directly to Firestore
 */
export async function saveToCloud(
  uid: string,
  partial: Partial<UserCloudData>
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...partial,
      lastSynced: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to update cloud data:', error);
  }
}
