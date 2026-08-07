import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCYRcCVnd7YA_UYtfE8naP7W-a5fCiJWUo",
  authDomain: "jinnah-hardware-store.firebaseapp.com",
  projectId: "jinnah-hardware-store",
  storageBucket: "jinnah-hardware-store.firebasestorage.app",
  messagingSenderId: "1064074776262",
  appId: "1:1064074776262:web:14815df163d675210191c7",
  measurementId: "G-CVG7FG07GZ"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
// Set persistence to LOCAL so the admin stays logged in
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
    console.error("Auth persistence error:", error);
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

// Initialize messaging conditionally (only in browser)
let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, auth, db, storage, messaging };
