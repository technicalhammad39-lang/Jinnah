import { NextResponse } from "next/server";
import { verifySmtpConnection } from "@/lib/email/smtp";
import { verifyImapConnection } from "@/lib/email/imap";
import { EmailSettings } from "@/lib/email/types";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { type, config } = await req.json();

    if (!type || !config) {
      return NextResponse.json({ error: "Invalid test request parameters" }, { status: 400 });
    }

    // If password was sent masked, fetch the actual encrypted password from DB
    let effectiveConfig: EmailSettings = { ...config };

    if (config.smtpPassword?.includes("••••") || config.imapPassword?.includes("••••")) {
      const app = getAdminApp();
      if (app) {
        const docSnap = await adminDb.collection("email_settings").doc("main").get();
        if (docSnap.exists) {
          const dbData = docSnap.data() as EmailSettings;
          if (config.smtpPassword?.includes("••••")) {
            effectiveConfig.smtpPassword = dbData.smtpPassword;
          }
          if (config.imapPassword?.includes("••••")) {
            effectiveConfig.imapPassword = dbData.imapPassword;
          }
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
