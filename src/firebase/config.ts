import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  collection,
  writeBatch
} from 'firebase/firestore';
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

let app: any;
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

// Define simulator actions for Real Firebase (Cloud Mode)
const realFirebaseSimulator = {
  async updateUserProfile(uid: string, data: any) {
    await setDoc(doc(realDb, 'users', uid), data, { merge: true });
  },

  async updateFarmerProfile(uid: string, data: any) {
    const land = data.landSize ?? 0;
    let category = 'marginal';
    if (land <= 2.5) {
      category = 'marginal';
    } else if (land <= 5) {
      category = 'small';
    } else {
      category = 'large';
    }
    await setDoc(doc(realDb, 'farmers', uid), { ...data, category }, { merge: true });
  },

  async submitApplication(userId: string, applicantName: string, type: string, details: any, documents: any[]) {
    const id = `app-${String(Math.floor(100 + Math.random() * 900))}`;
    const newApp = {
      id,
      userId,
      applicantName,
      type,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details,
      documents
    };
    await setDoc(doc(realDb, 'applications', id), newApp);
    return newApp;
  },

  async updateApplicationStatus(id: string, status: string, remarks?: string) {
    await updateDoc(doc(realDb, 'applications', id), {
      status,
      adminRemarks: remarks || null,
      updatedAt: new Date().toISOString()
    });

    const appDoc = await getDoc(doc(realDb, 'applications', id));
    if (appDoc.exists()) {
      const appData = appDoc.data();
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(realDb, 'notifications', notifId), {
        id: notifId,
        userId: appData.userId,
        title: `Application Status: ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your ${appData.type.toUpperCase()} Certificate application (${id}) has been marked as ${status.replace('_', ' ')}.${remarks ? ` Remarks: "${remarks}"` : ''}`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  async manageCrops(action: 'add' | 'edit' | 'delete', data: any) {
    if (action === 'add') {
      const id = `crop-${Date.now()}`;
      await setDoc(doc(realDb, 'crops', id), { ...data, id });
    } else if (action === 'edit' && data.id) {
      await updateDoc(doc(realDb, 'crops', data.id), data);
    } else if (action === 'delete' && data.id) {
      await deleteDoc(doc(realDb, 'crops', data.id));
    }
  },

  async manageSchemes(action: 'add' | 'edit' | 'delete', data: any) {
    if (action === 'add') {
      const id = `scheme-${Date.now()}`;
      await setDoc(doc(realDb, 'government_schemes', id), { ...data, id });
    } else if (action === 'edit' && data.id) {
      await updateDoc(doc(realDb, 'government_schemes', data.id), data);
    } else if (action === 'delete' && data.id) {
      await deleteDoc(doc(realDb, 'government_schemes', data.id));
    }
  },

  async updateWeather(data: any) {
    await setDoc(doc(realDb, 'weather', 'current'), data, { merge: true });
    return data;
  },

  async markNotificationsRead(userId: string) {
    const q = query(collection(realDb, 'notifications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(realDb);
    snapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  },

  async saveCropRecommendation(userId: string, soilType: string, season: string, waterAvailability: string, rec: any) {
    const id = `rec-${Date.now()}`;
    const newRec = {
      id,
      userId,
      soilType,
      season,
      waterAvailability,
      recommendation: rec,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(realDb, 'crop_recommendations', id), newRec);
    return newRec;
  },

  async submitNotice(category: string, title: string, content: string, organizedBy: string, venue?: string) {
    const id = `notice-${Date.now()}`;
    const newNotice = {
      id,
      category,
      title,
      content,
      date: new Date().toISOString(),
      organizedBy,
      venue: venue || null
    };
    await setDoc(doc(realDb, 'notices', id), newNotice);
    return newNotice;
  },

  async deleteNotice(id: string) {
    await deleteDoc(doc(realDb, 'notices', id));
  },

  async submitComplaint(userId: string, category: string, description: string, photoUrl: string, location: string) {
    const id = `comp-${Date.now()}`;
    const newComplaint = {
      id,
      userId,
      category,
      description,
      photoUrl: photoUrl || null,
      location,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(realDb, 'complaints', id), newComplaint);
    return newComplaint;
  },

  async updateComplaintStatus(complaintId: string, status: string, remarks: string) {
    await updateDoc(doc(realDb, 'complaints', complaintId), {
      status,
      adminRemarks: remarks || null,
      updatedAt: new Date().toISOString()
    });

    const compDoc = await getDoc(doc(realDb, 'complaints', complaintId));
    if (compDoc.exists()) {
      const compData = compDoc.data();
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(realDb, 'notifications', notifId), {
        id: notifId,
        userId: compData.userId,
        title: `Complaint Status Update`,
        message: `Your complaint (${complaintId}) regarding ${compData.category.toUpperCase()} is now marked: ${status.toUpperCase()}. Remarks: "${remarks || 'None'}"`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  async manageFacilities(action: 'add' | 'delete', data: any) {
    if (action === 'add') {
      const id = `fac-${Date.now()}`;
      await setDoc(doc(realDb, 'facilities', id), {
        id,
        category: data.category,
        name: data.name,
        ward: data.ward,
        details: data.details
      });
    } else if (action === 'delete') {
      await deleteDoc(doc(realDb, 'facilities', data.id));
    }
  }
};

// Initialize properties on realDb if cloud mode is active
if (!isSimulated && realDb) {
  (realDb as any).simulator = realFirebaseSimulator;
}

export const db = isSimulated
  ? {
      // Simulator reference
      simulator,
    }
  : realDb;

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
  : {
      // Real Firebase Auth wrapper that adds role resolution and Firestore profile sync
      get currentUser() {
        return realAuth?.currentUser;
      },
      onAuthStateChanged: (callback: (user: any) => void) => {
        return fbOnAuthStateChanged(realAuth, async (firebaseUser) => {
          if (!firebaseUser) {
            callback(null);
            return;
          }
          try {
            const userDoc = await getDoc(doc(realDb, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              callback({
                ...firebaseUser,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.displayName || firebaseUser.displayName,
                role: userData.role,
                status: userData.status,
                lastActive: userData.lastActive,
                createdAt: userData.createdAt
              });
            } else {
              callback(firebaseUser);
            }
          } catch (e) {
            console.error('Error fetching user profile from Firestore:', e);
            callback(firebaseUser);
          }
        });
      },
      signInWithEmailAndPassword: async (email: string, pass: string) => {
        const credential = await fbSignIn(realAuth, email, pass);
        const uid = credential.user.uid;
        await updateDoc(doc(realDb, 'users', uid), {
          status: 'online',
          lastActive: new Date().toISOString()
        });
        return credential.user;
      },
      createUserWithEmailAndPassword: async (email: string, pass: string, name: string, role: any) => {
        const credential = await fbCreateUser(realAuth, email, pass);
        const uid = credential.user.uid;
        // 1. Create Firestore user document
        await setDoc(doc(realDb, 'users', uid), {
          uid,
          email,
          displayName: name,
          role,
          createdAt: new Date().toISOString(),
          status: 'online',
          lastActive: new Date().toISOString()
        });
        // 2. Create matching farmer document if role is farmer
        if (role === 'farmer') {
          await setDoc(doc(realDb, 'farmers', uid), {
            userId: uid,
            landSize: 0,
            soilType: 'loamy',
            waterSource: 'rainfed',
            currentCrop: '',
            cropHistory: [],
            income: 0,
            category: 'marginal'
          });
        }
        return credential.user;
      },
      signOut: async () => {
        const currentUser = realAuth?.currentUser;
        if (currentUser) {
          try {
            await updateDoc(doc(realDb, 'users', currentUser.uid), {
              status: 'offline',
              lastActive: new Date().toISOString()
            });
          } catch (e) {
            console.error('Error updating user offline status on sign out:', e);
          }
        }
        await fbSignOut(realAuth);
      }
    };
