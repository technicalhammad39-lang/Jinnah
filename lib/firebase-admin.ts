import * as admin from 'firebase-admin';

// Use a global variable to preserve the singleton across HMR in Next.js development
const globalForFirebaseAdmin = global as unknown as {
  firebaseAdminApp: admin.app.App | undefined;
};

let adminApp: admin.app.App;

if (globalForFirebaseAdmin.firebaseAdminApp) {
  adminApp = globalForFirebaseAdmin.firebaseAdminApp;
} else {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin initialization failed. Missing required environment variables:");
    console.error(`- FIREBASE_PROJECT_ID: ${!!projectId}`);
    console.error(`- FIREBASE_CLIENT_EMAIL: ${!!clientEmail}`);
    console.error(`- FIREBASE_PRIVATE_KEY: ${!!privateKey}`);
    
    // Initialize without credentials so the app doesn't crash on build/import, 
    // but operations requiring credentials will fail explicitly where they are used.
    adminApp = admin.initializeApp({
      projectId: projectId || 'jinnah-hardware-store',
    });
  } else {
    try {
      // Parse private key correctly whether it contains literal \n characters or actual newlines
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin initialized successfully with credentials.");
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      // Fallback initialization
      adminApp = admin.initializeApp({
        projectId: projectId || 'jinnah-hardware-store',
      });
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForFirebaseAdmin.firebaseAdminApp = adminApp;
  }
}

export { adminApp };
export const adminDb = admin.firestore(adminApp);
export const adminAuth = admin.auth(adminApp);
export const adminStorage = admin.storage(adminApp);
