import nodemailer, { SendMailOptions, TransportOptions } from "nodemailer";
import { EmailSettings, EmailAttachment } from "./types";
import { decryptCredential } from "./crypto";
import { saveEmailMessageDoc, saveEmailLogDoc } from "./db";

/**
 * Creates a Nodemailer transporter instance using saved or provided settings.
 */
export function createSmtpTransporter(settings: EmailSettings) {
  const host = (settings.smtpHost || "").trim();
  const user = (settings.smtpUser || "").trim();
  const port = Number(settings.smtpPort) || 465;
  // If port is 465, default secure is true (SSL). If 587, secure is false (STARTTLS).
  const secure = settings.smtpSecure !== undefined ? Boolean(settings.smtpSecure) : port === 465;

  if (!host || !user) {
    throw new Error("SMTP Host and Username are required to initialize mailer.");
  }

  const plainPassword = decryptCredential(settings.smtpPassword).trim();

  const config: TransportOptions = {
    host,
    port,
    secure,
    auth: {
      user,
      pass: plainPassword,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert handshake blocks on custom VPS/cPanel
      ciphers: "SSLv3",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as any;

  return nodemailer.createTransport(config);
}

/**
 * Formats user-friendly diagnostic messages for SMTP errors.
 */
function formatSmtpErrorMessage(error: any, settings: EmailSettings): string {
  const msg = error.message || "";
  const code = error.code || "";

  if (msg.includes("535") || code === "EAUTH") {
    if (settings.smtpHost?.includes("hostinger")) {
      return (
        "Hostinger Authentication Failed (535): Username or password rejected by smtp.hostinger.com. " +
        "Please check: " +
        "(1) In Hostinger hPanel > Emails > Manage, confirm the password for this specific email address. " +
        "(2) Make sure to use your Email Account password (NOT your main Hostinger hosting login password). " +
        "(3) Test logging in at https://mail.hostinger.com with this exact email and password."
      );
    }
    return `Authentication failed (535): Incorrect username or password for ${settings.smtpHost}. Please verify credentials.`;
  }

  if (code === "ETIMEDOUT" || code === "ESOCKET" || msg.includes("timeout")) {
    return `Connection timed out connecting to ${settings.smtpHost}:${settings.smtpPort}. Check if port is open or try port 587 (with SSL unchecked) instead.`;
  }

  if (code === "ECONNREFUSED") {
    return `Connection refused by ${settings.smtpHost}:${settings.smtpPort}. Please check host address and port number.`;
  }

  return msg || "Failed to authenticate with SMTP server.";
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
    const friendlyMsg = formatSmtpErrorMessage(error, settings);
    return {
      success: false,
      message: friendlyMsg,
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
    const convId = conversationId || `conv-${Date.now()}`;
    const toArray = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

    try {
      await saveEmailMessageDoc({
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
      await saveEmailLogDoc({
        type: "smtp_send",
        status: "success",
        to: Array.isArray(to) ? to.join(", ") : to,
        from: fromAddress,
        subject,
        messageId,
        timestamp: new Date().toISOString(),
      });
    } catch (saveErr) {
      console.warn("[SMTP Send] Note: Dispatched successfully via SMTP, but audit log save had issue:", saveErr);
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error("[SMTP Send Error]:", error);

    // Record failure in audit logs if possible
    try {
      await saveEmailLogDoc({
        type: "smtp_send",
        status: "error",
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        errorDetails: error.message || "Unknown SMTP dispatch error",
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error("[Log Error]:", logErr);
    }

    return {
      success: false,
      error: error.message || "Failed to dispatch email through SMTP.",
    };
  }
}
