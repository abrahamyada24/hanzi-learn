import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type FeedbackCategory = 'suggestion' | 'bug' | 'correction' | 'review' | 'other';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface FeedbackData {
  id?: string;
  category: FeedbackCategory;
  rating: number; // 1 to 5
  message: string;
  userName: string;
  userEmail: string | null;
  userId: string | null;
  deviceInfo?: {
    platform: string;
    isStandalone: boolean;
    theme: string;
    userAgent: string;
  };
  createdAt?: any;
  status: FeedbackStatus;
  adminNote?: string;
}

/**
 * Submit feedback to Firestore
 */
export async function submitFeedback(data: Omit<FeedbackData, 'status' | 'createdAt'>): Promise<string> {
  const feedbackCol = collection(db, 'feedback');
  const docRef = await addDoc(feedbackCol, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Fetch all feedback entries (ordered by createdAt desc)
 */
export async function getFeedbackList(maxCount: number = 100): Promise<FeedbackData[]> {
  try {
    const feedbackCol = collection(db, 'feedback');
    const q = query(feedbackCol, orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        category: data.category || 'other',
        rating: data.rating || 5,
        message: data.message || '',
        userName: data.userName || 'Anonim',
        userEmail: data.userEmail || null,
        userId: data.userId || null,
        deviceInfo: data.deviceInfo,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        status: data.status || 'new',
        adminNote: data.adminNote || ''
      };
    });
  } catch (error) {
    console.error('Failed to get feedback list:', error);
    // Fallback: If index is missing or error, return empty or retry without orderBy
    try {
      const feedbackCol = collection(db, 'feedback');
      const snap = await getDocs(feedbackCol);
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          category: data.category || 'other',
          rating: data.rating || 5,
          message: data.message || '',
          userName: data.userName || 'Anonim',
          userEmail: data.userEmail || null,
          userId: data.userId || null,
          deviceInfo: data.deviceInfo,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          status: data.status || 'new',
          adminNote: data.adminNote || ''
        };
      });
      return items.reverse();
    } catch (innerError) {
      console.error('Fallback feedback get also failed:', innerError);
      return [];
    }
  }
}

/**
 * Update feedback status (e.g. mark reviewed or resolved)
 */
export async function updateFeedbackStatus(
  feedbackId: string, 
  status: FeedbackStatus, 
  adminNote?: string
): Promise<void> {
  const docRef = doc(db, 'feedback', feedbackId);
  const payload: Record<string, any> = { status };
  if (adminNote !== undefined) {
    payload.adminNote = adminNote;
  }
  await updateDoc(docRef, payload);
}

/**
 * Delete feedback item
 */
export async function deleteFeedbackItem(feedbackId: string): Promise<void> {
  const docRef = doc(db, 'feedback', feedbackId);
  await deleteDoc(docRef);
}
