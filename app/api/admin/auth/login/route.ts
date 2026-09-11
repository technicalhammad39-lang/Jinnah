import { NextResponse } from "next/server";
import { getClientRequestContext } from "@/lib/security/request-context";
import {
  evaluateLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { triggerFailedLoginSecurityAlert } from "@/lib/security/alerts";
import { createAdminSession } from "@/lib/security/session-manager";
import { adminAuth, adminDb, getAdminApp } from "@/lib/firebase-admin";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCYRcCVnd7YA_UYtfE8naP7W-a5fCiJWUo";

export async function POST(req: Request) {
  const clientContext = getClientRequestContext(req);

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Dual-Layer Brute-Force Rate Limit Check (IP + Account)
    const rateLimitStatus = await evaluateLoginRateLimit(clientContext.ip, email);

    if (!rateLimitStatus.allowed) {
      await logSecurityEvent({
        eventType: "TEMPORARILY_BLOCKED",
        email,
        clientContext,
        result: "BLOCKED",
        reason: `Brute force defense active. Request rejected. Blocked for ${rateLimitStatus.remainingSeconds}s`,
      });

      return NextResponse.json(
        {
          error: "Too many failed login attempts. Access temporarily restricted. Please try again later.",
          retryAfter: rateLimitStatus.remainingSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitStatus.remainingSeconds),
          },
        }
      );
    }

    // 2. Progressive Delay (sleep) for consecutive failed attempts to thwart automated scripts
    if (rateLimitStatus.progressiveDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, rateLimitStatus.progressiveDelayMs));
    }

    // 3. Verify Credentials via Firebase Authentication Identity Toolkit
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const authData = await verifyRes.json();

    // 4. Handle Failed Authentication
    if (!verifyRes.ok || !authData.localId) {
      const failInfo = await recordFailedLoginAttempt(clientContext.ip, email);

      await logSecurityEvent({
        eventType: "FAILED_LOGIN",
        email,
        clientContext,
        result: "FAILED",
        reason: "Invalid admin credentials (failed password/email verification)",
      });

      // Trigger security alert if threshold is reached
      if (failInfo.isTriggerAlert) {
        await triggerFailedLoginSecurityAlert({
          targetEmail: email,
          clientContext,
          attemptsCount: failInfo.attemptsCount,
        });
      }

      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const uid = authData.localId;

    // 5. Verify Admin Authorization in Firestore (role === "admin")
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json(
        { error: "Authentication service currently unavailable" },
        { status: 503 }
      );
    }

    const adminDoc = await adminDb.collection("adminUsers").doc(uid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      // User authenticated in Firebase, but does NOT possess admin privileges
      await recordFailedLoginAttempt(clientContext.ip, email);

      await logSecurityEvent({
        eventType: "FAILED_LOGIN",
        uid,
        email,
        clientContext,
        result: "FAILED",
        reason: "User lacks required 'admin' role in adminUsers collection",
      });

      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 403 }
      );
    }

    // 6. Reset brute-force counter on successful verification
    await resetLoginRateLimit(clientContext.ip, email);

    // 7. Create Active Admin Session and Set-Cookie Header
    const { session, cookieHeader } = await createAdminSession({
      uid,
      email,
      clientContext,
    });

    // 8. Log Successful Login
    await logSecurityEvent({
      eventType: "SUCCESSFUL_LOGIN",
      uid,
      email,
      clientContext,
      result: "SUCCESS",
      reason: "Successful admin authentication",
      sessionId: session.sessionId,
    });

    // 9. Generate Firebase custom token so client SDK stays seamlessly hydrated
    let customToken: string | null = null;
    try {
      customToken = await adminAuth.createCustomToken(uid);
    } catch (tokenErr) {
      console.warn("[AdminLogin] Custom token creation notice:", tokenErr);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        uid,
        email,
        displayName: adminDoc.data()?.displayName || "Admin",
      },
      customToken,
      sessionId: session.sessionId,
    });

    // Attach HttpOnly, Secure, SameSite session cookie
    response.headers.append("Set-Cookie", cookieHeader);

    return response;
  } catch (error: any) {
    console.error("[AdminLogin API Error]:", error);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
