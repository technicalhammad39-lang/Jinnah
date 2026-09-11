import { NextResponse } from "next/server";
import { verifyAdminSession, revokeSession, getClearSessionCookieHeader } from "@/lib/security/session-manager";
import { getClientRequestContext } from "@/lib/security/request-context";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export async function POST(req: Request) {
  const clientContext = getClientRequestContext(req);
  const sessionResult = await verifyAdminSession(req);

  if (sessionResult.valid && sessionResult.sessionId) {
    await revokeSession(sessionResult.sessionId, clientContext, "User clicked logout");

    await logSecurityEvent({
      eventType: "LOGOUT",
      uid: sessionResult.uid || null,
      email: sessionResult.email || null,
      clientContext,
      result: "SUCCESS",
      reason: "User logged out successfully",
      sessionId: sessionResult.sessionId,
    });
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.headers.append("Set-Cookie", getClearSessionCookieHeader());
  return response;
}
