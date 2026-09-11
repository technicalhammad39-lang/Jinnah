import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { LoginEventType, LoginHistoryEvent } from "./types";
import { ParsedClientContext } from "./request-context";
import crypto from "crypto";

export interface LogEventParams {
  eventType: LoginEventType;
  uid?: string | null;
  email?: string | null;
  clientContext: ParsedClientContext;
  result: "SUCCESS" | "FAILED" | "BLOCKED" | "REVOKED";
  reason: string;
  sessionId?: string | null;
}

/**
 * Records an immutable security audit event in the `security_login_history` collection.
 * Strictly guarantees that no passwords, tokens, cookies, or secrets are ever recorded.
 */
export async function logSecurityEvent(params: LogEventParams): Promise<void> {
  const eventId = `log_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const timestamp = new Date().toISOString();

  // Sanitize email: normalize to lower case, no whitespace
  const cleanEmail = params.email ? params.email.trim().toLowerCase() : null;

  const eventDoc: LoginHistoryEvent = {
    id: eventId,
    uid: params.uid || null,
    email: cleanEmail,
    eventType: params.eventType,
    timestamp,
    ip: params.clientContext.ip,
    browser: params.clientContext.browser,
    os: params.clientContext.os,
    deviceType: params.clientContext.deviceType,
    userAgent: params.clientContext.userAgent.slice(0, 300), // Limit UA length
    result: params.result,
    reason: params.reason.slice(0, 200),
    sessionId: params.sessionId || null,
  };

  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("security_login_history").doc(eventId).set(eventDoc);
    } else {
      console.warn("[SecurityAudit] Firebase Admin not available to record audit log:", eventDoc);
    }
  } catch (err: any) {
    console.error("[SecurityAudit] Failed to record login history event:", err?.message || err);
  }
}
