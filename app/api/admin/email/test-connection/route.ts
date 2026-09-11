import { NextResponse } from "next/server";
import { verifySmtpConnection } from "@/lib/email/smtp";
import { verifyImapConnection } from "@/lib/email/imap";
import { EmailSettings } from "@/lib/email/types";
import { getStoredEmailSettings } from "@/lib/email/db";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const { type, config } = await req.json();

    if (!type || !config) {
      return NextResponse.json({ error: "Invalid test request parameters" }, { status: 400 });
    }

    // If password was sent masked, fetch the actual encrypted password from DB
    let effectiveConfig: EmailSettings = {
      ...config,
      smtpHost: (config.smtpHost || "").trim(),
      smtpUser: (config.smtpUser || "").trim(),
      imapHost: (config.imapHost || "").trim(),
      imapUser: (config.imapUser || "").trim(),
    };

    if (config.smtpPassword?.includes("••••") || config.imapPassword?.includes("••••") || !config.smtpPassword || !config.imapPassword) {
      const dbData = await getStoredEmailSettings();
      if (dbData) {
        if (config.smtpPassword?.includes("••••") || !config.smtpPassword) {
          effectiveConfig.smtpPassword = dbData.smtpPassword;
        }
        if (config.imapPassword?.includes("••••") || !config.imapPassword) {
          effectiveConfig.imapPassword = dbData.imapPassword;
        }
      }
    }

    if (type === "smtp") {
      const result = await verifySmtpConnection(effectiveConfig);
      return NextResponse.json(result);
    } else if (type === "imap") {
      const result = await verifyImapConnection(effectiveConfig);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Unknown test type. Must be 'smtp' or 'imap'." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Test Connection API Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute connection test." },
      { status: 500 }
    );
  }
}

