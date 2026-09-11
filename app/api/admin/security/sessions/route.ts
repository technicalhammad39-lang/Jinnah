import { NextResponse } from "next/server";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";
import { getAdminSessions } from "@/lib/security/session-manager";

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success || !authResult.admin) {
    return adminUnauthorizedResponse(authResult);
  }

  const sessions = await getAdminSessions(authResult.admin.uid, authResult.admin.sessionId);

  return NextResponse.json({
    success: true,
    sessions,
    currentSessionId: authResult.admin.sessionId || null,
  });
}
