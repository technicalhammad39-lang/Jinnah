import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const hostingerUploadRoot = process.env.HOSTINGER_UPLOAD_ROOT;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  // Attempt initialization (will use cached singleton if already done)
  const adminApp = getAdminApp();

  // Basic sanity check without exposing values
  let keyStatus = 'MISSING';
  if (base64Key) {
    keyStatus = `present (Base64 length: ${base64Key.length})`;
  } else if (rawKey) {
    keyStatus = `present (Raw length: ${rawKey.length})`;
  }

  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    platform: process.platform,
    nodeVersion: process.version,
    
    firebase_admin: {
      FIREBASE_PROJECT_ID: projectId ? `present (${projectId})` : 'MISSING',
      FIREBASE_CLIENT_EMAIL: clientEmail ? 'present' : 'MISSING',
      FIREBASE_PRIVATE_KEY_BASE64: keyStatus,
      initialized: !!adminApp,
      status: adminApp ? '✓ Firebase Admin is working' : '✗ Firebase Admin is NOT configured (check logs)',
    },

    uploads: {
      HOSTINGER_UPLOAD_ROOT: hostingerUploadRoot || 'MISSING (will use fallback: cwd/.storage/uploads)',
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

  return NextResponse.json(diagnostic, { status: adminApp ? 200 : 503 });
}
