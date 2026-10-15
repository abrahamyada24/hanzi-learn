import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAA8lPKEcxFK20WhWAfQZE-yShKSHis8rY",
  authDomain: "mandarin-learn.firebaseapp.com",
  projectId: "mandarin-learn",
  storageBucket: "mandarin-learn.firebasestorage.app",
  messagingSenderId: "205061938400",
  appId: "1:205061938400:web:5dc0118025e0431b1cc485"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
