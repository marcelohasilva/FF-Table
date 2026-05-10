import { env } from '$env/dynamic/private';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID
};

export function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean);
}

function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error('Firebase não configurado.');
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
