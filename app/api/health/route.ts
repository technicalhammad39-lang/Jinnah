import { NextResponse } from 'next/server';
import { getFirebaseAdminDiagnostic, getAdminApp } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const adminApp = getAdminApp();
  const diag = getFirebaseAdminDiagnostic();

  const hostingerUploadRoot = process.env.HOSTINGER_UPLOAD_ROOT;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  // Check upload paths
  let uploadRootStatus = 'NOT SET';
  if (hostingerUploadRoot) {
    try {
      const exists = fs.existsSync(hostingerUploadRoot);
      uploadRootStatus = exists ? 'EXISTS on server' : 'SET BUT DIRECTORY DOES NOT EXIST';
    } catch {
      uploadRootStatus = 'ACCESS ERROR';
    }
  }

  const fallbackUploadDir = path.join(process.cwd(), '.storage/uploads');
  const fallbackExists = fs.existsSync(fallbackUploadDir);

  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd(),

    firebase_admin: {
      FIREBASE_PROJECT_ID: diag.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: diag.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_BASE64: diag.FIREBASE_PRIVATE_KEY_BASE64,
      base64_length: diag.base64_length,
      decoded_key_length: diag.decoded_key_length,
      decoded_key_starts_with_begin: diag.decoded_key_starts_with_begin,
      decoded_key_ends_with_end: diag.decoded_key_ends_with_end,
      initialized: !!adminApp,
      status: adminApp ? '✓ Firebase Admin is working' : `✗ Firebase Admin is NOT configured: ${diag.error_message || 'check logs'}`,
    },

    uploads: {
      HOSTINGER_UPLOAD_ROOT: hostingerUploadRoot || 'MISSING (will use fallback)',
      HOSTINGER_UPLOAD_ROOT_STATUS: uploadRootStatus,
      FALLBACK_DIR: fallbackUploadDir,
      FALLBACK_DIR_EXISTS: fallbackExists,
      NEXT_PUBLIC_UPLOAD_BASE_URL: process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || 'MISSING',
    },

    vapid: {
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'present' : 'MISSING',
      VAPID_PRIVATE_KEY: vapidPrivate ? 'present' : 'MISSING',
    },

    next_public: {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'present' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    },
  };

  return NextResponse.json(diagnostic, {
    status: adminApp ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
