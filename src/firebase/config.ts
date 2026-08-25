import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton)
export const firebaseApp: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfigJson)
  : getApp();

// Initialize Firebase Authentication
export const auth: Auth = getAuth(firebaseApp);

// Initialize Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore using the configured database ID
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(firebaseApp);

export const FIREBASE_CONFIG = firebaseConfigJson;
