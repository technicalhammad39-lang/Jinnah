import * as admin from 'firebase-admin';

// ============================================================
// Firebase Admin SDK — Production-Safe Singleton
// ============================================================
// This module provides a properly initialized Firebase Admin SDK
// for server-side API routes (/api/checkout, /api/notifications, etc.)
//
// Required Environment Variables (Production Runtime):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY_BASE64  (Primary production method)
//
// Fallback Environment Variable (Local Dev / Transition):
//   FIREBASE_PRIVATE_KEY         (Raw multiline or \n escaped key)
// ============================================================

// Global singleton to survive Next.js HMR in development and across module re-evaluations
const globalForFirebaseAdmin = global as unknown as {
  firebaseAdminApp: admin.app.App | undefined;
};

// Internal tracker for diagnostic and error reporting
let lastInitError: string | null = null;
let lastInitTimestamp: string | null = null;

/**
 * Validates that a parsed private key has the correct PEM structure.
 */
export function isValidPrivateKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return (
    (key.includes('-----BEGIN PRIVATE KEY-----') || key.includes('-----BEGIN RSA PRIVATE KEY-----')) &&
    (key.includes('-----END PRIVATE KEY-----') || key.includes('-----END RSA PRIVATE KEY-----'))
  );
}

/**
 * Decode and normalize the private key from Base64 or raw PEM.
 * Handles:
 * - Base64 strings with or without padding
 * - URL-safe Base64 strings (- and _)
 * - Harmless surrounding whitespace, newlines, and quotes
 * - Literal escaped newlines (\n, \\n) and CRLF (\r\n)
 * - Raw PEM passed into the Base64 variable by accident
 */
export function decodeAndNormalizePrivateKey(
  base64Key?: string,
  rawKey?: string
): { key: string; isBase64: boolean; error: string | null } {
  if (base64Key) {
    try {
      let cleanInput = base64Key.trim();

      // Strip surrounding single or double quotes
      if (
        (cleanInput.startsWith('"') && cleanInput.endsWith('"')) ||
        (cleanInput.startsWith("'") && cleanInput.endsWith("'"))
      ) {
        cleanInput = cleanInput.slice(1, -1).trim();
      }

      // Check if user accidentally provided the raw PEM instead of Base64
      if (cleanInput.includes('-----BEGIN')) {
        const normalized = cleanInput
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\\n/g, '\n')
          .trim();
        return { key: normalized, isBase64: false, error: null };
      }

      // Strip all internal whitespace/newlines that might corrupt Base64 decoding
      let sanitizedB64 = cleanInput.replace(/\s+/g, '');

      // Convert URL-safe base64 to standard base64 if necessary
      sanitizedB64 = sanitizedB64.replace(/-/g, '+').replace(/_/g, '/');

      // Add missing padding if needed
      while (sanitizedB64.length % 4 !== 0) {
        sanitizedB64 += '=';
      }

      let decoded = Buffer.from(sanitizedB64, 'base64').toString('utf8');

      // Strip surrounding quotes inside the decoded string if present
      if (
        (decoded.startsWith('"') && decoded.endsWith('"')) ||
        (decoded.startsWith("'") && decoded.endsWith("'"))
      ) {
        decoded = decoded.slice(1, -1).trim();
      }

      // Normalize all variations of newlines
      decoded = decoded
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();

      return { key: decoded, isBase64: true, error: null };
    } catch (err: any) {
      return { key: '', isBase64: true, error: `Base64 decoding failed: ${err.message}` };
    }
  }

  if (rawKey) {
    try {
      let decoded = rawKey.trim();
      if (
        (decoded.startsWith('"') && decoded.endsWith('"')) ||
        (decoded.startsWith("'") && decoded.endsWith("'"))
      ) {
        decoded = decoded.slice(1, -1).trim();
      }
      decoded = decoded
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();

      return { key: decoded, isBase64: false, error: null };
    } catch (err: any) {
      return { key: '', isBase64: false, error: `Raw key parsing failed: ${err.message}` };
    }
  }

  return { key: '', isBase64: false, error: 'No private key environment variable provided' };
}

/**
 * Log a safe diagnostic summary (never logs actual secrets).
 */
function logDiagnostic(
  projectId: string | undefined,
  clientEmail: string | undefined,
  hasBase64Key: boolean,
  hasRawFallbackKey: boolean,
  parsedKey: string | null,
  error: string | null
): void {
  console.log('[FIREBASE_ADMIN] Runtime configuration:');
  console.log(`  projectId:             ${projectId ? 'present (' + projectId + ')' : 'MISSING'}`);
  console.log(`  clientEmail:           ${clientEmail ? 'present' : 'MISSING'}`);
  console.log(`  privateKeyBase64:      ${hasBase64Key ? 'present' : 'MISSING'}`);
  if (hasRawFallbackKey) {
    console.log(`  privateKeyRawFallback: present`);
  }
  if (parsedKey) {
    const valid = isValidPrivateKeyFormat(parsedKey);
    console.log(`  decodedPem:            ${valid ? 'valid format' : 'INVALID (missing BEGIN/END markers)'}`);
  }
  if (error) {
    console.error(`[FIREBASE_ADMIN] Initialization FAILED: ${error}`);
  }
}

/**
 * Initialize Firebase Admin SDK.
 * Returns the app instance or null if initialization fails.
 * CRITICAL: Never permanently latches failures to null so that runtime retry is possible.
 */
function initializeFirebaseAdmin(): admin.app.App | null {
  // 1. Check if already initialized via global singleton
  if (globalForFirebaseAdmin.firebaseAdminApp) {
    return globalForFirebaseAdmin.firebaseAdminApp;
  }

  // 2. Check if already initialized via firebase-admin's internal app registry
  if (admin.apps.length > 0) {
    const existingApp = admin.apps.find((a) => a?.name === '[DEFAULT]') || admin.apps[0];
    if (existingApp) {
      globalForFirebaseAdmin.firebaseAdminApp = existingApp;
      lastInitError = null;
      lastInitTimestamp = new Date().toISOString();
      return existingApp;
    }
  }

  // 3. Read environment variables at RUNTIME
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const rawFallbackKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || (!base64Key && !rawFallbackKey)) {
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!base64Key && !rawFallbackKey) missing.push('FIREBASE_PRIVATE_KEY_BASE64');

    const err = `Missing required environment variables: ${missing.join(', ')}`;
    lastInitError = err;
    lastInitTimestamp = new Date().toISOString();
    logDiagnostic(projectId, clientEmail, !!base64Key, !!rawFallbackKey, null, err);
    return null;
  }

  // 4. Decode and normalize private key
  const { key: parsedKey, error: decodeError } = decodeAndNormalizePrivateKey(base64Key, rawFallbackKey);

  if (decodeError || !parsedKey) {
    const err = decodeError || 'Empty private key after decoding';
    lastInitError = err;
    lastInitTimestamp = new Date().toISOString();
    logDiagnostic(projectId, clientEmail, !!base64Key, !!rawFallbackKey, null, err);
    return null;
  }

  // 5. Validate PEM structure
  if (!isValidPrivateKeyFormat(parsedKey)) {
    const err = 'Decoded private key does not contain valid PEM BEGIN/END markers';
    lastInitError = err;
    lastInitTimestamp = new Date().toISOString();
    logDiagnostic(projectId, clientEmail, !!base64Key, !!rawFallbackKey, parsedKey, err);
    return null;
  }

  // 6. Initialize Firebase Admin SDK
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: parsedKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    globalForFirebaseAdmin.firebaseAdminApp = app;
    lastInitError = null;
    lastInitTimestamp = new Date().toISOString();

    logDiagnostic(projectId, clientEmail, !!base64Key, !!rawFallbackKey, parsedKey, null);
    console.log(`[FIREBASE_ADMIN] Initialization successful for project: ${projectId}`);

    return app;
  } catch (error: any) {
    const err = error.message || 'Unknown Firebase Admin initialization error';
    lastInitError = err;
    lastInitTimestamp = new Date().toISOString();
    logDiagnostic(projectId, clientEmail, !!base64Key, !!rawFallbackKey, parsedKey, err);
    return null;
  }
}

/**
 * Get the Firebase Admin app instance.
 * Lazily initializes on demand and re-attempts if previous attempt lacked env vars.
 */
export function getAdminApp(): admin.app.App | null {
  if (globalForFirebaseAdmin.firebaseAdminApp) {
    return globalForFirebaseAdmin.firebaseAdminApp;
  }
  return initializeFirebaseAdmin();
}

/**
 * Returns safe diagnostic information about the Firebase Admin configuration
 * for use in health/diagnostic routes. Never exposes secrets.
 */
export function getFirebaseAdminDiagnostic(): {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY_BASE64: string;
  base64_length: number;
  decoded_key_length: number;
  decoded_key_starts_with_begin: boolean;
  decoded_key_ends_with_end: boolean;
  initialization_status: 'success' | 'failure';
  error_message: string | null;
  timestamp: string;
} {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  const app = getAdminApp();

  const { key: parsedKey, error: decodeError } = decodeAndNormalizePrivateKey(base64Key, rawKey);

  const cleanB64 = (base64Key || '').replace(/^["']|["']$/g, '').trim();

  return {
    FIREBASE_PROJECT_ID: projectId ? `present (${projectId})` : 'missing',
    FIREBASE_CLIENT_EMAIL: clientEmail ? 'present' : 'missing',
    FIREBASE_PRIVATE_KEY_BASE64: base64Key ? 'present' : rawKey ? 'missing (using raw fallback)' : 'missing',
    base64_length: cleanB64.length,
    decoded_key_length: parsedKey ? parsedKey.length : 0,
    decoded_key_starts_with_begin: parsedKey
      ? parsedKey.includes('-----BEGIN PRIVATE KEY-----') || parsedKey.includes('-----BEGIN RSA PRIVATE KEY-----')
      : false,
    decoded_key_ends_with_end: parsedKey
      ? parsedKey.includes('-----END PRIVATE KEY-----') || parsedKey.includes('-----END RSA PRIVATE KEY-----')
      : false,
    initialization_status: app ? 'success' : 'failure',
    error_message: app ? null : lastInitError || decodeError || 'Firebase Admin not initialized',
    timestamp: lastInitTimestamp || new Date().toISOString(),
  };
}

/**
 * Backwards compatibility export: Proxy that resolves to the app or throws if accessed directly
 */
export const adminApp = new Proxy({} as admin.app.App, {
  get(_target, prop) {
    const app = getAdminApp();
    if (!app) {
      throw new Error(
        `Firebase Admin is not configured. Last error: ${lastInitError || 'Environment variables missing'}`
      );
    }
    const val = (app as any)[prop];
    return typeof val === 'function' ? val.bind(app) : val;
  },
});

/**
 * Create a Proxy that provides lazy access to Firebase Admin services.
 * Throws a descriptive error if Firebase Admin is not configured.
 */
const createProxy = <T extends object>(serviceName: string, initializer: () => T): T => {
  return new Proxy({} as T, {
    get(_target, prop) {
      const app = getAdminApp();
      if (!app) {
        throw new Error(
          `Firebase Admin is not configured — cannot access ${serviceName}. ` +
          `Last error: ${lastInitError || 'Missing credentials'}. ` +
          `Check server logs for "[FIREBASE_ADMIN] Runtime configuration" output. ` +
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
    },
  });
};

export const adminDb = createProxy('Firestore', () => admin.firestore(getAdminApp()!));
export const adminAuth = createProxy('Auth', () => admin.auth(getAdminApp()!));
export const adminStorage = createProxy('Storage', () => admin.storage(getAdminApp()!));
