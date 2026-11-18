// Menguji firestore.rules di emulator.  Jalankan:  npm run test:rules
import { readFileSync } from 'node:fs';
import { before, after, beforeEach, describe, it } from 'node:test';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';

const ADMIN = { uid: 'admin1', email: 'bram.simrs@gmail.com', email_verified: true };
const ALICE = { uid: 'alice', email: 'alice@example.com', email_verified: true };
const BOB = { uid: 'bob', email: 'bob@example.com', email_verified: true };

let env;

const as = (who) => env.authenticatedContext(who.uid, { email: who.email, email_verified: who.email_verified }).firestore();
const guest = () => env.unauthenticatedContext().firestore();

const goodFeedback = (extra = {}) => ({
  category: 'suggestion',
  rating: 5,
  message: 'Tampilannya bagus',
  userName: 'Pembelajar Hanzi',
  userEmail: null,
  userId: null,
  status: 'new',
  createdAt: serverTimestamp(),
  ...extra
});

const seedFeedback = async (id = 'f1') => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'feedback', id), {
      category: 'bug', rating: 3, message: 'Audio macet', userName: 'Alice',
      userEmail: ALICE.email, userId: ALICE.uid, status: 'new', createdAt: new Date()
    });
  });
};

const seedUser = async (uid, data = {}) => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users', uid), {
      progress: {}, stats: { streakDays: 1 }, bookmarks: [], email: `${uid}@example.com`, displayName: uid, ...data
    });
  });
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'mandarin-learn',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') }
  });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

describe('feedback: mengirim', () => {
  it('tamu boleh mengirim masukan yang valid', async () => {
    await assertSucceeds(addDoc(collection(guest(), 'feedback'), goodFeedback()));
  });
  it('pengguna login boleh mengirim dengan userId dan email sendiri', async () => {
    await assertSucceeds(addDoc(collection(as(ALICE), 'feedback'), goodFeedback({ userId: ALICE.uid, userEmail: ALICE.email })));
  });
  it('tidak boleh mengaku sebagai userId orang lain', async () => {
    await assertFails(addDoc(collection(as(ALICE), 'feedback'), goodFeedback({ userId: BOB.uid })));
  });
  it('tamu tidak boleh membawa userId atau email', async () => {
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ userId: 'alice' })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ userEmail: 'alice@example.com' })));
  });
  it('tidak boleh memakai email orang lain', async () => {
    await assertFails(addDoc(collection(as(ALICE), 'feedback'), goodFeedback({ userEmail: BOB.email })));
  });
  it('status harus "new" dan createdAt harus waktu server', async () => {
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ status: 'reviewed' })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ createdAt: new Date('2020-01-01') })));
  });
  it('menolak rating, kategori, dan pesan yang tidak valid', async () => {
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ rating: 9 })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ rating: 4.5 })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ category: 'spam' })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ message: '' })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ message: 'x'.repeat(2001) })));
  });
  it('menolak field tambahan', async () => {
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ isAdmin: true })));
    await assertFails(addDoc(collection(guest(), 'feedback'), goodFeedback({ adminNote: 'x' })));
  });
});

describe('feedback: membaca, mengubah, menghapus', () => {
  it('tamu dan pengguna biasa tidak boleh membaca', async () => {
    await seedFeedback();
    await assertFails(getDocs(collection(guest(), 'feedback')));
    await assertFails(getDocs(collection(as(ALICE), 'feedback')));
    await assertFails(getDoc(doc(as(ALICE), 'feedback', 'f1'))); // bahkan miliknya sendiri
  });
  it('admin boleh membaca', async () => {
    await seedFeedback();
    await assertSucceeds(getDocs(collection(as(ADMIN), 'feedback')));
    await assertSucceeds(getDoc(doc(as(ADMIN), 'feedback', 'f1')));
  });
  it('email admin dibandingkan tanpa peduli huruf besar-kecil', async () => {
    await seedFeedback();
    await assertSucceeds(getDocs(collection(as({ ...ADMIN, email: 'Bram.Simrs@Gmail.com' }), 'feedback')));
  });
  it('email admin yang belum terverifikasi ditolak', async () => {
    await seedFeedback();
    await assertFails(getDocs(collection(as({ ...ADMIN, email_verified: false }), 'feedback')));
  });
  it('pengguna biasa tidak boleh mengubah atau menghapus', async () => {
    await seedFeedback();
    await assertFails(updateDoc(doc(as(ALICE), 'feedback', 'f1'), { status: 'reviewed' }));
    await assertFails(deleteDoc(doc(as(ALICE), 'feedback', 'f1')));
    await assertFails(deleteDoc(doc(guest(), 'feedback', 'f1')));
  });
  it('admin boleh mengubah status dan catatan, tapi tidak isi pesan', async () => {
    await seedFeedback();
    await assertSucceeds(updateDoc(doc(as(ADMIN), 'feedback', 'f1'), { status: 'reviewed' }));
    await assertSucceeds(updateDoc(doc(as(ADMIN), 'feedback', 'f1'), { status: 'resolved', adminNote: 'sudah diperbaiki' }));
    await assertFails(updateDoc(doc(as(ADMIN), 'feedback', 'f1'), { message: 'diubah' }));
    await assertFails(updateDoc(doc(as(ADMIN), 'feedback', 'f1'), { status: 'bebas' }));
  });
  it('admin boleh menghapus', async () => {
    await seedFeedback();
    await assertSucceeds(deleteDoc(doc(as(ADMIN), 'feedback', 'f1')));
  });
});

describe('users', () => {
  it('pemilik boleh membaca dan menulis dokumennya sendiri', async () => {
    await assertSucceeds(setDoc(doc(as(ALICE), 'users', 'alice'), {
      progress: { w1: { status: 'mastered' } }, stats: { streakDays: 2 }, bookmarks: ['w1'],
      lastSynced: new Date().toISOString(), email: ALICE.email, displayName: 'Alice'
    }));
    await assertSucceeds(getDoc(doc(as(ALICE), 'users', 'alice')));
    await assertSucceeds(setDoc(doc(as(ALICE), 'users', 'alice'), { stats: { streakDays: 3 } }, { merge: true }));
  });
  it('email kosong diperbolehkan (pengguna tanpa email)', async () => {
    await assertSucceeds(setDoc(doc(as(ALICE), 'users', 'alice'), { email: '', displayName: '' }));
  });
  it('tamu dan pengguna lain tidak boleh membaca atau menulis', async () => {
    await seedUser('alice');
    await assertFails(getDoc(doc(guest(), 'users', 'alice')));
    await assertFails(getDoc(doc(as(BOB), 'users', 'alice')));
    await assertFails(setDoc(doc(as(BOB), 'users', 'alice'), { stats: { streakDays: 99 } }, { merge: true }));
    await assertFails(setDoc(doc(guest(), 'users', 'alice'), { stats: {} }));
  });
  it('hanya admin yang boleh list seluruh koleksi', async () => {
    await seedUser('alice'); await seedUser('bob');
    await assertSucceeds(getDocs(collection(as(ADMIN), 'users')));
    await assertFails(getDocs(collection(as(ALICE), 'users')));
    await assertFails(getDocs(collection(guest(), 'users')));
  });
  it('admin boleh membaca tetapi tidak boleh menulis dokumen orang lain', async () => {
    await seedUser('alice');
    await assertSucceeds(getDoc(doc(as(ADMIN), 'users', 'alice')));
    await assertFails(setDoc(doc(as(ADMIN), 'users', 'alice'), { stats: { streakDays: 1 } }, { merge: true }));
  });
  it('tidak boleh menyamar dengan email orang lain', async () => {
    await assertFails(setDoc(doc(as(ALICE), 'users', 'alice'), { email: 'bram.simrs@gmail.com' }));
  });
  it('menolak field tambahan, mis. isAdmin', async () => {
    await assertFails(setDoc(doc(as(ALICE), 'users', 'alice'), { isAdmin: true }));
  });
  it('dokumen pengguna tidak boleh dihapus lewat klien', async () => {
    await seedUser('alice');
    await assertFails(deleteDoc(doc(as(ALICE), 'users', 'alice')));
    await assertFails(deleteDoc(doc(as(ADMIN), 'users', 'alice')));
  });
});

describe('path lain', () => {
  it('semua koleksi lain ditolak, termasuk untuk admin', async () => {
    await assertFails(getDoc(doc(as(ADMIN), 'secrets', 'x')));
    await assertFails(setDoc(doc(as(ADMIN), 'config', 'x'), { a: 1 }));
    await assertFails(setDoc(doc(guest(), 'admins', 'me'), { ok: true }));
  });
});
