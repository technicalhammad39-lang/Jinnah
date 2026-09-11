import { adminDb, adminAuth, getAdminApp } from "@/lib/firebase-admin";
import { AdminSession } from "./types";
import { ParsedClientContext } from "./request-context";
import { logSecurityEvent } from "./audit-logger";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "jh_admin_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
const ACTIVITY_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes between lastActiveAt writes

/**
 * Retrieves the mandatory server-side secret used for HMAC-SHA256 session cookie signatures.
 * 
 * STRICT PRODUCTION RULES:
 * 1. In production (NODE_ENV === "production"), ADMIN_SESSION_SECRET is strictly MANDATORY.
 * 2. ZERO fallback to FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, APP_SECRET, or any other setting.
 * 3. ZERO deterministic fallback string in production.
 * 4. Fails closed with an explicit server configuration error if missing in production.
 * 5. In local development (NODE_ENV !== "production"), if unset, uses an isolated local dev key.
 */
function getSigningSecret(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (isProduction) {
    if (!secret) {
      const errorMsg = "[Security Configuration Error] Missing mandatory server environment variable: ADMIN_SESSION_SECRET. Admin sessions cannot be created or verified without an explicitly configured secret in production.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    if (secret.length < 32) {
      const errorMsg = "[Security Configuration Error] Insecure ADMIN_SESSION_SECRET: Production secret must be at least 32 characters.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    return secret;
  }

  // Development / test environments
  if (secret) {
    return secret;
  }

  // Safe development fallback only when NODE_ENV !== "production"
  return "dev_local_admin_session_secret_strictly_not_for_production";
}

export interface SessionPayload {
  sessionId: string;
  uid: string;
  email: string;
  createdAt: number;
  exp: number;
}

/**
 * Creates a cryptographically signed cookie token: base64Url(payload).base64Url(hmacSignature)
 */
export function signSessionPayload(payload: SessionPayload): string {
  const secret = getSigningSecret();
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", secret).update(serialized).digest("base64url");
  return `${serialized}.${hmac}`;
}

/**
 * Verifies and decodes a signed cookie token. Returns null if invalid, tampered with, or expired.
 * Fails closed if production secret is missing.
 */
export function verifyAndDecodeSessionCookie(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const [serialized, receivedHmac] = parts;
    const secret = getSigningSecret();
    const expectedHmac = crypto.createHmac("sha256", secret).update(serialized).digest("base64url");

    // Constant-time comparison to prevent timing attacks
    if (
      receivedHmac.length !== expectedHmac.length ||
      !crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(serialized, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err: any) {
    if (err?.message?.includes("[Security Configuration Error]")) {
      console.error("[SessionManager] Security Configuration Error during session verification:", err.message);
    }
    return null;
  }
}

/**
 * Extracts the session token from request cookies or Authorization header.
 */
export function extractSessionToken(req: Request): string | null {
  // 1. Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        return decodeURIComponent(c.substring(SESSION_COOKIE_NAME.length + 1));
      }
    }
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Creates a new active session record in Firestore and generates a signed session cookie.
 */
export async function createAdminSession(params: {
  uid: string;
  email: string;
  clientContext: ParsedClientContext;
}): Promise<{ session: AdminSession; cookieHeader: string; cookieToken: string }> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const createdAtIso = new Date(now).toISOString();

  const sessionDoc: AdminSession = {
    id: sessionId,
    sessionId,
    uid: params.uid,
    email: params.email.trim().toLowerCase(),
    createdAt: createdAtIso,
    lastActiveAt: createdAtIso,
    status: "active",
    ip: params.clientContext.ip,
    userAgent: params.clientContext.userAgent.slice(0, 300),
    browser: params.clientContext.browser,
    os: params.clientContext.os,
    deviceType: params.clientContext.deviceType,
  };

  const app = getAdminApp();
  if (app) {
    await adminDb.collection("security_admin_sessions").doc(sessionId).set(sessionDoc);
  }

  // Create signed cookie token
  const payload: SessionPayload = {
    sessionId,
    uid: params.uid,
    email: params.email,
    createdAt: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const cookieToken = signSessionPayload(payload);
  const isProd = process.env.NODE_ENV === "production";
  const cookieHeader = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    cookieToken
  )}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`;

  return { session: sessionDoc, cookieHeader, cookieToken };
}

/**
 * Verifies that a request has an active, non-revoked session.
 * Throttles `lastActiveAt` updates to save database writes.
 */
export async function verifyAdminSession(
  req: Request
): Promise<{ valid: boolean; session?: AdminSession; uid?: string; email?: string; sessionId?: string }> {
  const token = extractSessionToken(req);
  if (!token) {
    return { valid: false };
  }

  // 1. Try our signed HMAC session token
  const payload = verifyAndDecodeSessionCookie(token);

  if (payload) {
    try {
      const app = getAdminApp();
      if (!app) return { valid: false };

      const sessionSnap = await adminDb
        .collection("security_admin_sessions")
        .doc(payload.sessionId)
        .get();

      if (!sessionSnap.exists) {
        return { valid: false };
      }

      const session = sessionSnap.data() as AdminSession;
      if (session.status !== "active") {
        return { valid: false };
      }

      // Throttled update of lastActiveAt
      const now = Date.now();
      const lastActiveMs = new Date(session.lastActiveAt).getTime();
      if (now - lastActiveMs > ACTIVITY_THROTTLE_MS) {
        const updatedIso = new Date(now).toISOString();
        adminDb
          .collection("security_admin_sessions")
          .doc(payload.sessionId)
          .update({ lastActiveAt: updatedIso })
          .catch(() => {});
      }

      return {
        valid: true,
        session,
        uid: payload.uid,
        email: payload.email,
        sessionId: payload.sessionId,
      };
    } catch (err) {
      console.error("[SessionManager] Error verifying session document:", err);
      return { valid: false };
    }
  }

  // 2. Fallback: Check if client passed a raw Firebase ID Token directly in Authorization: Bearer
  try {
    const app = getAdminApp();
    if (app) {
      const decoded = await adminAuth.verifyIdToken(token, true); // checkRevoked = true
      if (decoded && decoded.uid) {
        return {
          valid: true,
          uid: decoded.uid,
          email: decoded.email || "",
          sessionId: undefined,
        };
      }
    }
  } catch (err: any) {
    // Not a valid Firebase ID Token
  }

  return { valid: false };
}

/**
 * Revokes a single session by sessionId.
 */
export async function revokeSession(
  sessionId: string,
  clientContext: ParsedClientContext,
  reason: string = "User initiated single session revocation"
): Promise<boolean> {
  try {
    const app = getAdminApp();
    if (!app) return false;

    const docRef = adminDb.collection("security_admin_sessions").doc(sessionId);
    const snap = await docRef.get();
    if (!snap.exists) return false;

    const session = snap.data() as AdminSession;
    const nowIso = new Date().toISOString();

    await docRef.update({
      status: "revoked",
      revokedAt: nowIso,
      revokedReason: reason,
    });

    await logSecurityEvent({
      eventType: "SESSION_REVOKED",
      uid: session.uid,
      email: session.email,
      clientContext,
      result: "REVOKED",
      reason: `Revoked session ${sessionId.slice(0, 8)}: ${reason}`,
      sessionId,
    });

    return true;
  } catch (err) {
    console.error("[SessionManager] Error revoking session:", err);
    return false;
  }
}

/**
 * Revokes all OTHER active sessions for a user, keeping the current session active.
 */
export async function revokeAllOtherSessions(
  uid: string,
  currentSessionId: string,
  clientContext: ParsedClientContext
): Promise<number> {
  try {
    const app = getAdminApp();
    if (!app) return 0;

    const snap = await adminDb
      .collection("security_admin_sessions")
      .where("uid", "==", uid)
      .where("status", "==", "active")
      .get();

    let revokedCount = 0;
    const nowIso = new Date().toISOString();
    const batch = adminDb.batch();

    snap.docs.forEach((d) => {
      const data = d.data() as AdminSession;
      if (data.sessionId !== currentSessionId) {
        batch.update(d.ref, {
          status: "revoked",
          revokedAt: nowIso,
          revokedReason: "Revoked all other sessions from current active device",
        });
        revokedCount++;
      }
    });

    if (revokedCount > 0) {
      await batch.commit();

      await logSecurityEvent({
        eventType: "ALL_SESSIONS_REVOKED",
        uid,
        email: null,
        clientContext,
        result: "REVOKED",
        reason: `Revoked ${revokedCount} other active session(s)`,
        sessionId: currentSessionId,
      });
    }

    return revokedCount;
  } catch (err) {
    console.error("[SessionManager] Error revoking other sessions:", err);
    return 0;
  }
}

/**
 * Revokes ALL active sessions for a user, including the current session,
 * and invalidates all Firebase refresh tokens server-side.
 */
export async function revokeAllSessions(
  uid: string,
  clientContext: ParsedClientContext
): Promise<number> {
  try {
    const app = getAdminApp();
    if (!app) return 0;

    // 1. Revoke in Firebase Authentication
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch (authRevokeErr) {
      console.warn("[SessionManager] Firebase Auth token revocation notice:", authRevokeErr);
    }

    // 2. Mark all sessions revoked in Firestore
    const snap = await adminDb
      .collection("security_admin_sessions")
      .where("uid", "==", uid)
      .where("status", "==", "active")
      .get();

    let revokedCount = 0;
    const nowIso = new Date().toISOString();
    const batch = adminDb.batch();

    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        status: "revoked",
        revokedAt: nowIso,
        revokedReason: "Explicit Revoke All Sessions request",
      });
      revokedCount++;
    });

    if (revokedCount > 0) {
      await batch.commit();
    }

    await logSecurityEvent({
      eventType: "ALL_SESSIONS_REVOKED",
      uid,
      email: null,
      clientContext,
      result: "REVOKED",
      reason: `Revoked all ${revokedCount} active sessions and refreshed tokens`,
      sessionId: null,
    });

    return revokedCount;
  } catch (err) {
    console.error("[SessionManager] Error revoking all sessions:", err);
    return 0;
  }
}

/**
 * Returns all sessions for a user sorted by creation date.
 */
export async function getAdminSessions(
  uid: string,
  currentSessionId?: string
): Promise<Array<AdminSession & { isCurrent: boolean }>> {
  try {
    const app = getAdminApp();
    if (!app) return [];

    const snap = await adminDb
      .collection("security_admin_sessions")
      .where("uid", "==", uid)
      .get();

    const sessions = snap.docs
      .map((d) => {
        const s = d.data() as AdminSession;
        return {
          ...s,
          isCurrent: Boolean(currentSessionId && s.sessionId === currentSessionId),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return sessions;
  } catch (err) {
    console.error("[SessionManager] Error loading admin sessions:", err);
    return [];
  }
}

/**
 * Generates an expired Set-Cookie header to clear the session cookie.
 */
export function getClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`;
}
