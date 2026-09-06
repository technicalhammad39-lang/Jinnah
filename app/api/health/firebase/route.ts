import { NextResponse } from 'next/server';
import { getFirebaseAdminDiagnostic } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const diag = getFirebaseAdminDiagnostic();

  const responseBody = {
    FIREBASE_PROJECT_ID: diag.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: diag.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY_BASE64: diag.FIREBASE_PRIVATE_KEY_BASE64,
    base64_length: diag.base64_length,
    decoded_key_length: diag.decoded_key_length,
    decoded_key_starts_with_begin: diag.decoded_key_starts_with_begin,
    decoded_key_ends_with_end: diag.decoded_key_ends_with_end,
    initialization_status: diag.initialization_status,
    error_message: diag.error_message,
    node_version: process.version,
    node_env: process.env.NODE_ENV || 'unknown',
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  };

  const status = diag.initialization_status === 'success' ? 200 : 503;

  return NextResponse.json(responseBody, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
