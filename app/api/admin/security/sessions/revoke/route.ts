import { NextResponse } from "next/server";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";
import {
  revokeSession,
  revokeAllOtherSessions,
  revokeAllSessions,
  getClearSessionCookieHeader,
} from "@/lib/security/session-manager";
import { getClientRequestContext } from "@/lib/security/request-context";

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success || !authResult.admin) {
    return adminUnauthorizedResponse(authResult);
  }

  const clientContext = getClientRequestContext(req);
  const currentSessionId = authResult.admin.sessionId || "";
  const uid = authResult.admin.uid;

  const body = await req.json().catch(() => ({}));
  const action = body.action as "single" | "others" | "all";
  const targetSessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

  if (action === "others") {
    const revokedCount = await revokeAllOtherSessions(uid, currentSessionId, clientContext);
    return NextResponse.json({
      success: true,
      message: `Revoked ${revokedCount} other active session(s). Your current session remains active.`,
      revokedCount,
    });
  }

  if (action === "all") {
    const revokedCount = await revokeAllSessions(uid, clientContext);
    const response = NextResponse.json({
      success: true,
      message: "All sessions and security tokens have been revoked. You have been logged out.",
      revokedCount,
    });
    response.headers.append("Set-Cookie", getClearSessionCookieHeader());
    return response;
  }

  if (action === "single" && targetSessionId) {
    const success = await revokeSession(targetSessionId, clientContext, "Revoked from active sessions dashboard");
    if (!success) {
      return NextResponse.json({ error: "Failed to revoke session or session not found" }, { status: 404 });
    }

    const isCurrent = targetSessionId === currentSessionId;
    const response = NextResponse.json({
      success: true,
      message: isCurrent ? "Current session revoked. You have been logged out." : "Session successfully revoked.",
      isCurrent,
    });

    if (isCurrent) {
      response.headers.append("Set-Cookie", getClearSessionCookieHeader());
    }

    return response;
  }

  return NextResponse.json({ error: "Invalid revocation request action" }, { status: 400 });
}
