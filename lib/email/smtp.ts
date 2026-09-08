import nodemailer, { SendMailOptions, TransportOptions } from "nodemailer";
import { EmailSettings, EmailAttachment } from "./types";
import { decryptCredential } from "./crypto";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";

/**
 * Creates a Nodemailer transporter instance using saved or provided settings.
 */
export function createSmtpTransporter(settings: EmailSettings) {
  if (!settings.smtpHost || !settings.smtpUser) {
    throw new Error("SMTP Host and Username are required to initialize mailer.");
  }

  const plainPassword = decryptCredential(settings.smtpPassword);

  const config: TransportOptions = {
    host: settings.smtpHost,
    port: Number(settings.smtpPort) || 465,
    secure: Boolean(settings.smtpSecure), // true for 465, false for 587
    auth: {
      user: settings.smtpUser,
      pass: plainPassword,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert handshake blocks on custom VPS
    },
  } as any;

  return nodemailer.createTransport(config);
}

/**
 * Verifies SMTP connection credentials and returns diagnostics.
 */
export async function verifySmtpConnection(settings: EmailSettings): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  try {
    const transporter = createSmtpTransporter(settings);
    await transporter.verify();
    return {
      success: true,
      message: `SMTP Connected successfully to ${settings.smtpHost}:${settings.smtpPort}`,
    };
  } catch (error: any) {
    console.error("[SMTP Verify Error]:", error);
    return {
      success: false,
      message: error.message || "Failed to authenticate with SMTP server.",
      code: error.code || "SMTP_AUTH_FAILED",
    };
  }
}

interface SendMailParams {
  settings: EmailSettings;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string | string[];
  attachments?: EmailAttachment[];
  conversationId?: string;
}

/**
 * Dispatches an email via SMTP and stores audit log and sent copy in Firestore.
 */
export async function sendEmailViaSmtp(params: SendMailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { settings, to, cc, bcc, subject, html, text, replyTo, inReplyTo, references, attachments, conversationId } = params;

  if (!settings.smtpEnabled) {
    throw new Error("SMTP outgoing mail is currently disabled in Email Center settings.");
  }

  try {
    const transporter = createSmtpTransporter(settings);

    // Format attachments for Nodemailer
    const formattedAttachments = (attachments || []).map((att) => {
      if (att.content) {
        return {
          filename: att.filename,
          content: Buffer.from(att.content, "base64"),
          contentType: att.contentType,
          cid: att.cid,
        };
      }
      return {
        filename: att.filename,
        path: att.url,
        contentType: att.contentType,
        cid: att.cid,
      };
    });

    const fromAddress = settings.fromName
      ? `"${settings.fromName}" <${settings.fromEmail || settings.smtpUser}>`
      : settings.fromEmail || settings.smtpUser;

    const mailOptions: SendMailOptions = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(", ") : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
      replyTo: replyTo || settings.replyToEmail || settings.fromEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, "").trim(),
      inReplyTo,
      references,
      attachments: formattedAttachments,
    };

    const info = await transporter.sendMail(mailOptions);
    const messageId = info.messageId || `jh-msg-${Date.now()}@jinnahhardware`;

    // Persist to Firestore "emails" folder: "sent"
    const app = getAdminApp();
    if (app) {
      const convId = conversationId || `conv-${Date.now()}`;
      const toArray = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

      const sentDocRef = adminDb.collection("emails").doc();
      await sentDocRef.set({
        id: sentDocRef.id,
        folder: "sent",
        conversationId: convId,
        from: {
          name: settings.fromName || "Jinnah Hardware",
          email: settings.fromEmail || settings.smtpUser,
        },
        to: toArray,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]).map((e) => ({ email: e })) : [],
        subject,
        bodyHtml: html,
        bodyText: text || html.replace(/<[^>]*>?/gm, "").trim(),
        snippet: (text || html.replace(/<[^>]*>?/gm, "")).slice(0, 140),
        isRead: true,
        isStarred: false,
        isImportant: false,
        hasAttachments: formattedAttachments.length > 0,
        attachments: (attachments || []).map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          size: a.size || 0,
          url: a.url || "",
        })),
        status: "sent",
        messageId,
        inReplyTo: inReplyTo || null,
        createdAt: new Date().toISOString(),
      });

      // Write transmission audit log
      await adminDb.collection("email_logs").add({
        type: "smtp_send",
        status: "success",
        to: Array.isArray(to) ? to.join(", ") : to,
        from: fromAddress,
        subject,
        messageId,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error("[SMTP Send Error]:", error);

    // Record failure in audit logs if possible
    try {
      const app = getAdminApp();
      if (app) {
        await adminDb.collection("email_logs").add({
          type: "smtp_send",
          status: "error",
          to: Array.isArray(to) ? to.join(", ") : to,
          subject,
          errorDetails: error.message || "Unknown SMTP dispatch error",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (logErr) {
      console.error("[Log Error]:", logErr);
    }

    return {
      success: false,
      error: error.message || "Failed to dispatch email through SMTP.",
    };
  }
}
