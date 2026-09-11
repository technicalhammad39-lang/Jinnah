import { NextResponse } from "next/server";
import { getStoredEmailSettings } from "@/lib/email/db";
import { syncImapInbox } from "@/lib/email/imap";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const settings = await getStoredEmailSettings();

    if (!settings) {
      return NextResponse.json(
        { error: "Email settings not found. Please configure IMAP settings first." },
        { status: 400 }
      );
    }

    if (!settings.imapEnabled) {
      return NextResponse.json(
        { error: "IMAP incoming synchronization is disabled in settings." },
        { status: 400 }
      );
    }

    const { limit = 25 } = await req.json().catch(() => ({}));
    const result = await syncImapInbox(settings, Number(limit) || 25);

    return NextResponse.json({
      success: result.success,
      syncedCount: result.syncedCount,
      lastSyncAt: new Date().toISOString(),
      error: result.error,
    });
  } catch (error: any) {
    console.error("[IMAP Sync API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync IMAP emails." },
      { status: 500 }
    );
  }
}
