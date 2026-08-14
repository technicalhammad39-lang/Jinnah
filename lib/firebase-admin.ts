import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newlines in private key securely
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn("Firebase Admin missing credentials, initializing with mock.");
      admin.initializeApp({
        projectId: 'jinnah-hardware-store'
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminApp = admin.apps.length > 0 ? admin.app() : undefined;
export const adminDb = adminApp ? admin.firestore(adminApp) : undefined;
export const adminAuth = adminApp ? admin.auth(adminApp) : undefined;
export const adminStorage = adminApp ? admin.storage(adminApp) : undefined;
