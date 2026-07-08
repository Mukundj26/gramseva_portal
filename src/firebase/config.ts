import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { simulator } from './simulator';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all essential keys exist
const isFirebaseConfigured =
  typeof window !== 'undefined' &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain;

let app;
let realAuth: any = null;
let realDb: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    realDb = getFirestore(app);
  } catch (e) {
    console.error('Firebase initialization failed, running simulator:', e);
  }
}

export const isSimulated = !realAuth || !realDb;

export const auth = isSimulated
  ? {
      // Mock auth object mapping to simulator operations
      currentUser: null,
      onAuthStateChanged: (callback: (user: any) => void) => {
        // Initial sync
        callback(simulator.getCurrentUser());
        // Listen to changes
        return simulator.subscribe(() => {
          callback(simulator.getCurrentUser());
        });
      },
      signInWithEmailAndPassword: (email: string, pass: string) =>
        simulator.login(email, pass),
      createUserWithEmailAndPassword: (email: string, pass: string, name: string, role: any) =>
        simulator.register(email, name, role),
      signOut: () => Promise.resolve(simulator.logout()),
    }
  : realAuth;

export const db = isSimulated
  ? {
      // Simulator reference
      simulator,
    }
  : realDb;
