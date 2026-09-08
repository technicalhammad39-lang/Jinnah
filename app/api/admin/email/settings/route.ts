import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { EmailSettings } from "@/lib/email/types";
import { encryptCredential, maskSensitive } from "@/lib/email/crypto";

export async function GET() {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const docSnap = await adminDb.collection("email_settings").doc("main").get();
    let settings: EmailSettings;

    if (docSnap.exists) {
      settings = docSnap.data() as EmailSettings;
    } else {
      // Default initial configuration
      settings = {
        providerPreset: "hostinger",
        smtpEnabled: true,
        smtpHost: "smtp.hostinger.com",
        smtpPort: 465,
        smtpUser: "info@hammadgfx.online",
        smtpSecure: true,
        fromEmail: "info@hammadgfx.online",
        fromName: "Jinnah Hardware Store",
        replyToEmail: "info@hammadgfx.online",

        imapEnabled: true,
        imapHost: "imap.hostinger.com",
        imapPort: 993,
        imapUser: "info@hammadgfx.online",
        imapSecure: true,
        autoSyncIntervalMinutes: 15,
        lastSyncAt: null,
      };
    }

    // Mask passwords for security
    const sanitizedSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? maskSensitive(settings.smtpPassword) : "",
      imapPassword: settings.imapPassword ? maskSensitive(settings.imapPassword) : "",
    };

    return NextResponse.json({ success: true, settings: sanitizedSettings });
  } catch (error: any) {
    console.error("[Email Settings GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const docSnap = await adminDb.collection("email_settings").doc("main").get();
    const existing = docSnap.exists ? (docSnap.data() as EmailSettings) : null;

    let smtpPassToSave = existing?.smtpPassword || "";
    if (body.smtpPassword && !body.smtpPassword.includes("••••")) {
      smtpPassToSave = encryptCredential(body.smtpPassword);
    }

    let imapPassToSave = existing?.imapPassword || "";
    if (body.imapPassword && !body.imapPassword.includes("••••")) {
      imapPassToSave = encryptCredential(body.imapPassword);
    }

    const payloadToSave: EmailSettings = {
      providerPreset: body.providerPreset || "custom",
      smtpEnabled: Boolean(body.smtpEnabled),
      smtpHost: body.smtpHost || "",
      smtpPort: Number(body.smtpPort) || 465,
      smtpUser: body.smtpUser || "",
      smtpPassword: smtpPassToSave,
      smtpSecure: Boolean(body.smtpSecure),
      fromEmail: body.fromEmail || body.smtpUser || "",
      fromName: body.fromName || "Jinnah Hardware Store",
      replyToEmail: body.replyToEmail || body.fromEmail || "",

      imapEnabled: Boolean(body.imapEnabled),
      imapHost: body.imapHost || "",
      imapPort: Number(body.imapPort) || 993,
      imapUser: body.imapUser || "",
      imapPassword: imapPassToSave,
      imapSecure: Boolean(body.imapSecure),
      autoSyncIntervalMinutes: Number(body.autoSyncIntervalMinutes) || 15,
      lastSyncAt: existing?.lastSyncAt || null,

      signatureHtml: body.signatureHtml || "",
      defaultReplyTemplateId: body.defaultReplyTemplateId || "",
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("email_settings").doc("main").set(payloadToSave, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Email settings saved and encrypted successfully.",
    });
  } catch (error: any) {
    console.error("[Email Settings POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
