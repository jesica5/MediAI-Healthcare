import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY',
  authDomain: 'medi-ai-1bead.firebaseapp.com',
  projectId: 'medi-ai-1bead',
  storageBucket: 'medi-ai-1bead.firebasestorage.app',
  messagingSenderId: '509645038432',
  appId: '1:509645038432:web:8591ee6082aeb8e7ecb405',
  measurementId: 'G-J7Y6SD593D',
};

// Initialize Firebase App singleton
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
