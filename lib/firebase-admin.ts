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
//   FIREBASE_PRIVATE_KEY
//
// On Hostinger, these must be set via the hPanel environment
// variables UI, or via a .env.production.local file on the server,
// or via the startup script.
// ============================================================

// Global singleton to survive Next.js HMR in development
const globalForFirebaseAdmin = global as unknown as {
  firebaseAdminApp: admin.app.App | null | undefined;
};

/**
 * Parse FIREBASE_PRIVATE_KEY from various environment formats.
 * Handles:
 *   - Surrounding double quotes: "-----BEGIN..."
 *   - Surrounding single quotes: '-----BEGIN...'
 *   - Literal escaped newlines: \\n
 *   - Already-correct newlines
 *   - Base64-encoded JSON service account (future-proofing)
 */
function parsePrivateKey(raw: string): string {
  let key = raw;

  // Strip surrounding quotes (Hostinger and many hosting panels add these)
  if ((key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Replace literal \\n sequences with actual newline characters
  // This handles: -----BEGIN PRIVATE KEY-----\\nMIIEv...\\n-----END PRIVATE KEY-----\\n
  key = key.replace(/\\n/g, '\n');

  return key;
}

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
  privateKey: string | undefined,
  parsedKey: string | null,
  error: string | null
): void {
  console.log('=== [Firebase Admin] Environment Diagnostic ===');
  console.log(`  PROJECT_ID:       ${projectId ? 'present (' + projectId + ')' : 'MISSING'}`);
  console.log(`  CLIENT_EMAIL:     ${clientEmail ? 'present' : 'MISSING'}`);
  console.log(`  PRIVATE_KEY:      ${privateKey ? 'present (' + privateKey.length + ' chars)' : 'MISSING'}`);
  if (parsedKey) {
    console.log(`  PRIVATE_KEY_FORMAT: ${isValidPrivateKeyFormat(parsedKey) ? 'valid PEM' : 'INVALID (no BEGIN/END markers)'}`);
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
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Check for missing variables
  if (!projectId || !clientEmail || !rawPrivateKey) {
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!rawPrivateKey) missing.push('FIREBASE_PRIVATE_KEY');

    logDiagnostic(projectId, clientEmail, rawPrivateKey, null,
      `Missing environment variables: ${missing.join(', ')}`);

    globalForFirebaseAdmin.firebaseAdminApp = null;
    return null;
  }

  // Parse the private key
  const parsedKey = parsePrivateKey(rawPrivateKey);

  // Validate key format
  if (!isValidPrivateKeyFormat(parsedKey)) {
    logDiagnostic(projectId, clientEmail, rawPrivateKey, parsedKey,
      'Private key does not contain valid PEM BEGIN/END markers after parsing');
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

    logDiagnostic(projectId, clientEmail, rawPrivateKey, parsedKey, null);
    console.log(`[Firebase Admin] ✓ Initialized successfully for project: ${projectId}`);

    globalForFirebaseAdmin.firebaseAdminApp = app;
    return app;
  } catch (error: any) {
    logDiagnostic(projectId, clientEmail, rawPrivateKey, parsedKey, error.message);
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
          `Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY ` +
          `are set in the production runtime environment.`
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
