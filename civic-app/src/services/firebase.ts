import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Live Firebase Configuration for project: testagy-001
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyCivicSolve2026AppConfig",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "testagy-001.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "testagy-001",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "testagy-001.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:a1b2c3d4e5f6g7h8"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Messaging export (with browser capability check)
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export default app;
