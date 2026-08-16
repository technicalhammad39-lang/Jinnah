import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
      // Robustly handle private key formatting (escaped newlines, accidental quotes)
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin initialized successfully with credentials.");
    } else {
      console.warn("Firebase Admin missing credentials, initializing with mock.");
      console.warn(`Missing: PROJECT_ID=${!!process.env.FIREBASE_PROJECT_ID}, EMAIL=${!!process.env.FIREBASE_CLIENT_EMAIL}, KEY=${!!privateKey}`);
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'jinnah-hardware-store'
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminApp = admin.apps.length > 0 ? admin.app() : undefined;
export const adminDb = adminApp ? admin.firestore(adminApp) : undefined;
export const adminAuth = adminApp ? admin.auth(adminApp) : undefined;
export const adminStorage = adminApp ? admin.storage(adminApp) : undefined;

// Export a flag to let API routes know if this is a mock initialization
export const isMockAdmin = !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL;
