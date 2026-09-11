import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth-guard";
import { adminAuth, adminDb, getAdminApp } from "@/lib/firebase-admin";
import { getClientRequestContext } from "@/lib/security/request-context";
import { createAdminSession } from "@/lib/security/session-manager";

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req);

  if (!authResult.success) {
    return NextResponse.json({ authenticated: false, error: authResult.error }, { status: authResult.status || 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      uid: authResult.admin?.uid,
      email: authResult.admin?.email,
      sessionId: authResult.admin?.sessionId,
    },
  });
}

/**
 * POST /api/admin/auth/session
 * Allows an already authenticated Firebase Client (e.g. from an existing session or page refresh)
 * to establish or refresh their server-side session cookie using an ID token.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let idToken = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      idToken = authHeader.substring(7).trim();
    } else {
      const body = await req.json().catch(() => ({}));
      idToken = body.idToken || "";
    }

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required to establish session" }, { status: 400 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Authentication service offline" }, { status: 503 });
    }

    // Verify Firebase ID Token
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Verify Admin Role in Firestore
    const adminDoc = await adminDb.collection("adminUsers").doc(decoded.uid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "User is not authorized as an administrator" }, { status: 403 });
    }

    // Create active session and issue cookie
    const clientContext = getClientRequestContext(req);
    const { session, cookieHeader } = await createAdminSession({
      uid: decoded.uid,
      email: decoded.email || adminDoc.data()?.email || "",
      clientContext,
    });

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      admin: {
        uid: decoded.uid,
        email: decoded.email || adminDoc.data()?.email || "",
        sessionId: session.sessionId,
      },
    });

    response.headers.append("Set-Cookie", cookieHeader);
    return response;
  } catch (error: any) {
    console.error("[AdminSessionSync API Error]:", error);
    return NextResponse.json({ error: "Failed to establish admin session" }, { status: 401 });
  }
}
