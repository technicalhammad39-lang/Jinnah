import * as admin from 'firebase-admin';

// Use a global variable to preserve the singleton across HMR in Next.js development
const globalForFirebaseAdmin = global as unknown as {
  firebaseAdminApp: admin.app.App | null | undefined;
};

let adminApp: admin.app.App | null = null;

if (globalForFirebaseAdmin.firebaseAdminApp !== undefined) {
  adminApp = globalForFirebaseAdmin.firebaseAdminApp;
} else if (admin.apps.length > 0) {
  adminApp = admin.apps[0] as admin.app.App;
} else {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
    
    console.error(`[Firebase Admin] Initialization skipped. Missing variables: ${missing.join(', ')}`);
    adminApp = null;
  } else {
    try {
      // Parse private key correctly whether it contains literal \n characters, actual newlines, or is wrapped in quotes
      let formattedPrivateKey = privateKey;
      
      // Remove surrounding quotes if present (Hostinger sometimes passes them)
      if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
        formattedPrivateKey = formattedPrivateKey.slice(1, -1);
      } else if (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'")) {
        formattedPrivateKey = formattedPrivateKey.slice(1, -1);
      }
      
      // Replace literal escaped newlines with actual newline characters
      formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log(`[Firebase Admin] Initialized successfully for project: ${projectId}`);
    } catch (error: any) {
      console.error('[Firebase Admin] Initialization error details:', error.message);
      adminApp = null;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForFirebaseAdmin.firebaseAdminApp = adminApp;
  }
}

export { adminApp };

const createProxy = <T extends object>(initializer: () => T): T => {
  return new Proxy({} as T, {
    get(target, prop) {
      if (!adminApp) {
        throw new Error("Firebase Admin is not configured. Missing Service Account Key.");
      }
      const instance = initializer();
      const value = (instance as any)[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    }
  });
};

export const adminDb = createProxy(() => admin.firestore(adminApp!));
export const adminAuth = createProxy(() => admin.auth(adminApp!));
export const adminStorage = createProxy(() => admin.storage(adminApp!));
