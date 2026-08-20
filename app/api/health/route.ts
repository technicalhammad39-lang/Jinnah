import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

/**
 * Health check endpoint for diagnosing Firebase Admin configuration.
 * 
 * GET /api/health
 * 
 * Returns a safe diagnostic summary — NEVER exposes actual credentials.
 * Use this after deploying to Hostinger to verify the runtime environment.
 */
export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const hostingerUploadRoot = process.env.HOSTINGER_UPLOAD_ROOT;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  // Attempt initialization (will use cached singleton if already done)
  const adminApp = getAdminApp();

  // Parse private key status
  let privateKeyStatus = 'MISSING';
  if (rawPrivateKey) {
    let parsed = rawPrivateKey;
    if ((parsed.startsWith('"') && parsed.endsWith('"')) ||
        (parsed.startsWith("'") && parsed.endsWith("'"))) {
      parsed = parsed.slice(1, -1);
    }
    parsed = parsed.replace(/\\n/g, '\n');

    if (parsed.includes('-----BEGIN') && parsed.includes('-----END')) {
      privateKeyStatus = 'present (valid PEM format)';
    } else {
      privateKeyStatus = `present but INVALID format (${rawPrivateKey.length} chars, no PEM markers found)`;
    }
  }

  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    platform: process.platform,
    nodeVersion: process.version,
    
    firebase_admin: {
      FIREBASE_PROJECT_ID: projectId ? `present (${projectId})` : 'MISSING',
      FIREBASE_CLIENT_EMAIL: clientEmail ? 'present' : 'MISSING',
      FIREBASE_PRIVATE_KEY: privateKeyStatus,
      initialized: !!adminApp,
      status: adminApp ? '✓ Firebase Admin is working' : '✗ Firebase Admin is NOT configured',
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
