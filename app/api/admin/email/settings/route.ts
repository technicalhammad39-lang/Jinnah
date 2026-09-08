import { NextResponse } from "next/server";
import { EmailSettings } from "@/lib/email/types";
import { encryptCredential, maskSensitive } from "@/lib/email/crypto";
import { getStoredEmailSettings, saveStoredEmailSettings } from "@/lib/email/db";

export async function GET() {
  try {
    const existing = await getStoredEmailSettings();

    let settings: EmailSettings;

    if (existing) {
      settings = existing;
    } else {
      // Default initial configuration
      settings = {
        providerPreset: "hostinger",
        smtpEnabled: true,
        smtpHost: "smtp.hostinger.com",
        smtpPort: 465,
        smtpUser: "info@jinnah-hardwarestore.com",
        smtpSecure: true,
        fromEmail: "info@jinnah-hardwarestore.com",
        fromName: "Jinnah Hardware Store",
        replyToEmail: "info@jinnah-hardwarestore.com",

        imapEnabled: true,
        imapHost: "imap.hostinger.com",
        imapPort: 993,
        imapUser: "info@jinnah-hardwarestore.com",
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
    const body = await req.json();
    const existing = await getStoredEmailSettings();

    let smtpPassToSave = existing?.smtpPassword || "";
    if (body.smtpPassword && !body.smtpPassword.includes("••••")) {
      smtpPassToSave = encryptCredential(body.smtpPassword.trim());
    }

    let imapPassToSave = existing?.imapPassword || "";
    if (body.imapPassword && !body.imapPassword.includes("••••")) {
      imapPassToSave = encryptCredential(body.imapPassword.trim());
    }

    const payloadToSave: EmailSettings = {
      providerPreset: body.providerPreset || "custom",
      smtpEnabled: Boolean(body.smtpEnabled),
      smtpHost: (body.smtpHost || "").trim(),
      smtpPort: Number(body.smtpPort) || 465,
      smtpUser: (body.smtpUser || "").trim(),
      smtpPassword: smtpPassToSave,
      smtpSecure: body.smtpSecure !== undefined ? Boolean(body.smtpSecure) : Number(body.smtpPort) === 465,
      fromEmail: (body.fromEmail || body.smtpUser || "").trim(),
      fromName: (body.fromName || "Jinnah Hardware Store").trim(),
      replyToEmail: (body.replyToEmail || body.fromEmail || "").trim(),

      imapEnabled: Boolean(body.imapEnabled),
      imapHost: (body.imapHost || "").trim(),
      imapPort: Number(body.imapPort) || 993,
      imapUser: (body.imapUser || "").trim(),
      imapPassword: imapPassToSave,
      imapSecure: body.imapSecure !== undefined ? Boolean(body.imapSecure) : Number(body.imapPort) === 993,
      autoSyncIntervalMinutes: Number(body.autoSyncIntervalMinutes) || 15,
      lastSyncAt: existing?.lastSyncAt || null,

      signatureHtml: body.signatureHtml || "",
      defaultReplyTemplateId: body.defaultReplyTemplateId || "",
      updatedAt: new Date().toISOString(),
    };

    await saveStoredEmailSettings(payloadToSave);

    return NextResponse.json({
      success: true,
      message: "Email settings saved and encrypted successfully.",
    });
  } catch (error: any) {
    console.error("[Email Settings POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}

