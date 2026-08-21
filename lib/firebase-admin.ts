import * as admin from 'firebase-admin';

// ============================================================
// Firebase Admin SDK — Production-Safe Singleton
// ============================================================
// This module provides a properly initialized Firebase Admin SDK
// for server-side API routes (/api/checkout, /api/notifications, etc.)
//
// CRITICAL: The 3 environment variables below MUST be available
// in the production Node.js runtime (NOT just at build time):
//
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY_BASE64
//
// On Hostinger, these must be set via the hPanel environment
// variables UI, or via a .env.production.local file on the server.
// ============================================================

// Global singleton to survive Next.js HMR in development
const globalForFirebaseAdmin = global as unknown as {
  firebaseAdminApp: admin.app.App | null | undefined;
};

/**
 * Validates that a parsed private key has the correct PEM structure.
 */
function isValidPrivateKeyFormat(key: string): boolean {
  return key.includes('-----BEGIN') && key.includes('-----END');
}

/**
 * Log a safe diagnostic summary (never logs actual secrets).
 */
function logDiagnostic(
  projectId: string | undefined,
  clientEmail: string | undefined,
  hasBase64Key: boolean,
  parsedKey: string | null,
  error: string | null
): void {
  console.log('=== [Firebase Admin] Environment Diagnostic ===');
  console.log(`  PROJECT_ID:       ${projectId ? 'present (' + projectId + ')' : 'MISSING'}`);
  console.log(`  CLIENT_EMAIL:     ${clientEmail ? 'present' : 'MISSING'}`);
  console.log(`  PRIVATE_KEY (B64): ${hasBase64Key ? 'present' : 'MISSING'}`);
  if (parsedKey) {
    console.log(`  DECODED_PEM:      ${isValidPrivateKeyFormat(parsedKey) ? 'valid format' : 'INVALID (no BEGIN/END markers)'}`);
  }
  if (error) {
    console.log(`  INIT_ERROR:       ${error}`);
  }
  console.log('================================================');
}

/**
 * Initialize Firebase Admin SDK.
 * Returns the app instance or null if initialization fails.
 */
function initializeFirebaseAdmin(): admin.app.App | null {
  // Check if already initialized via global singleton (HMR safety)
  if (globalForFirebaseAdmin.firebaseAdminApp !== undefined) {
    return globalForFirebaseAdmin.firebaseAdminApp;
  }

  // Check if already initialized via firebase-admin's internal registry
  if (admin.apps.length > 0) {
    const app = admin.apps[0] as admin.app.App;
    globalForFirebaseAdmin.firebaseAdminApp = app;
    return app;
  }

  // Read environment variables at RUNTIME
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  // We explicitly want the BASE64 version
  // If the user still has the raw one, we fallback to it for backward compatibility during transition,
  // but we STRONGLY prefer the BASE64 one.
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const rawFallbackKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || (!base64Key && !rawFallbackKey)) {
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!base64Key && !rawFallbackKey) missing.push('FIREBASE_PRIVATE_KEY_BASE64');

    logDiagnostic(projectId, clientEmail, false, null,
      `Missing environment variables: ${missing.join(', ')}`);

    globalForFirebaseAdmin.firebaseAdminApp = null;
    return null;
  }

  let parsedKey = '';

  try {
    if (base64Key) {
      // Decode Base64 securely
      let decoded = Buffer.from(base64Key, 'base64').toString('utf8');
      
      // Strip accidental surrounding quotes that hosting providers might inject
      if ((decoded.startsWith('"') && decoded.endsWith('"')) || (decoded.startsWith("'") && decoded.endsWith("'"))) {
        decoded = decoded.slice(1, -1);
      }

      // Ensure explicit replacement of literal '\\n' with standard '\n'
      decoded = decoded.replace(/\\n/g, '\n').trim();
      parsedKey = decoded;
    } else if (rawFallbackKey) {
      let decoded = rawFallbackKey;
      if ((decoded.startsWith('"') && decoded.endsWith('"')) || (decoded.startsWith("'") && decoded.endsWith("'"))) {
        decoded = decoded.slice(1, -1);
      }
      decoded = decoded.replace(/\\n/g, '\n').trim();
      parsedKey = decoded;
    }
  } catch (err: any) {
    logDiagnostic(projectId, clientEmail, !!base64Key, null, 'Failed to decode or parse private key: ' + err.message);
    globalForFirebaseAdmin.firebaseAdminApp = null;
    return null;
  }

  // Validate key format
  if (!isValidPrivateKeyFormat(parsedKey)) {
    logDiagnostic(projectId, clientEmail, !!base64Key, parsedKey,
      'Private key does not contain valid PEM BEGIN/END markers after decoding');
    globalForFirebaseAdmin.firebaseAdminApp = null;
    return null;
  }

  // Initialize
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: parsedKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    logDiagnostic(projectId, clientEmail, !!base64Key, parsedKey, null);
    console.log(`[Firebase Admin] ✓ Initialized successfully for project: ${projectId}`);

    globalForFirebaseAdmin.firebaseAdminApp = app;
    return app;
  } catch (error: any) {
    logDiagnostic(projectId, clientEmail, !!base64Key, parsedKey, error.message);
    console.error(`[Firebase Admin] ✗ Initialization failed: ${error.message}`);

    globalForFirebaseAdmin.firebaseAdminApp = null;
    return null;
  }
}

// Initialize on module load
let adminApp = initializeFirebaseAdmin();

// Export the app instance
export { adminApp };

/**
 * Get the Firebase Admin app, attempting re-initialization if previously failed.
 * This handles the edge case where env vars become available after module load.
 */
export function getAdminApp(): admin.app.App | null {
  if (!adminApp) {
    // Re-attempt initialization (env vars might be available now)
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}

/**
 * Create a Proxy that provides lazy access to Firebase Admin services.
 * Throws a descriptive error if Firebase Admin is not configured.
 */
const createProxy = <T extends object>(serviceName: string, initializer: () => T): T => {
  return new Proxy({} as T, {
    get(_target, prop) {
      // Re-attempt initialization on access if not yet initialized
      const app = getAdminApp();
      if (!app) {
        throw new Error(
          `Firebase Admin is not configured — cannot access ${serviceName}. ` +
          `Check server logs for "[Firebase Admin] Environment Diagnostic" output. ` +
          `Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY_BASE64 ` +
          `are correctly set in the production runtime environment.`
        );
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

export const adminDb = createProxy('Firestore', () => admin.firestore(getAdminApp()!));
export const adminAuth = createProxy('Auth', () => admin.auth(getAdminApp()!));
export const adminStorage = createProxy('Storage', () => admin.storage(getAdminApp()!));
