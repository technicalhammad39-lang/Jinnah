import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/session-manager";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { AdminSession } from "@/lib/security/types";

export interface AdminAuthResult {
  success: boolean;
  status?: number;
  error?: string;
  admin?: {
    uid: string;
    email: string;
    sessionId?: string;
    session?: AdminSession;
  };
}

/**
 * Production-grade Server-side Admin Authentication & Authorization Guard.
 * Fails closed: Denies access if session is invalid, revoked, expired, or user lacks admin role.
 */
export async function verifyAdminRequest(req: Request): Promise<AdminAuthResult> {
  try {
    // 1. Verify Active Session (checks cryptographic signature + active session document)
    const sessionResult = await verifyAdminSession(req);

    if (!sessionResult.valid || !sessionResult.uid) {
      return {
        success: false,
        status: 401,
        error: "Unauthorized: Active admin session required",
      };
    }

    const { uid, email, sessionId, session } = sessionResult;

    // 2. Verify Admin Authorization in Firestore (role === "admin")
    const app = getAdminApp();
    if (!app) {
      return {
        success: false,
        status: 503,
        error: "Service unavailable: Authentication backend offline",
      };
    }

    const adminDoc = await adminDb.collection("adminUsers").doc(uid).get();

    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      return {
        success: false,
        status: 403,
        error: "Forbidden: User is not authorized as an administrator",
      };
    }

    return {
      success: true,
      admin: {
        uid,
        email: email || adminDoc.data()?.email || "",
        sessionId,
        session,
      },
    };
  } catch (error: any) {
    console.error("[AdminAuthGuard] Unexpected verification error:", error);
    return {
      success: false,
      status: 500,
      error: "Internal security verification error",
    };
  }
}

/**
 * Convenience helper to return an immediate NextResponse error if authorization fails.
 */
export function adminUnauthorizedResponse(result: AdminAuthResult): NextResponse {
  return NextResponse.json(
    { error: result.error || "Unauthorized" },
    { status: result.status || 401 }
  );
}
