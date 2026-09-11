import { NextResponse } from "next/server";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { LoginHistoryEvent } from "@/lib/security/types";

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success || !authResult.admin) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));

    const snap = await adminDb
      .collection("security_login_history")
      .orderBy("timestamp", "desc")
      .limit(limitParam)
      .get();

    const events: LoginHistoryEvent[] = snap.docs.map((d) => d.data() as LoginHistoryEvent);

    return NextResponse.json({
      success: true,
      events,
      totalCount: events.length,
    });
  } catch (err: any) {
    console.error("[LoginHistory API Error]:", err);
    return NextResponse.json({ error: "Failed to load login history" }, { status: 500 });
  }
}
