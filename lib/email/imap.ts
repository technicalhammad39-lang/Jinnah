import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { EmailSettings, EmailMessage } from "./types";
import { decryptCredential } from "./crypto";
import { saveEmailMessageDoc, saveEmailLogDoc, saveStoredEmailSettings, findEmailByMessageId } from "./db";

/**
 * Creates an ImapFlow client instance using EmailSettings.
 */
export function createImapClient(settings: EmailSettings) {
  const host = (settings.imapHost || "").trim();
  const user = (settings.imapUser || "").trim();
  const port = Number(settings.imapPort) || 993;
  const secure = settings.imapSecure !== undefined ? Boolean(settings.imapSecure) : port === 993;

  if (!host || !user) {
    throw new Error("IMAP Host and Username are required.");
  }

  const plainPassword = decryptCredential(settings.imapPassword).trim();

  return new ImapFlow({
    host,
    port,
    secure,
    auth: {
      user,
      pass: plainPassword,
    },
    logger: false,
    tls: {
      rejectUnauthorized: false, // Prevents certificate chain issues on custom cPanel / Hostinger mail servers
    },
    connectionTimeout: 10000,
  });
}

/**
 * Formats user-friendly diagnostic messages for IMAP errors.
 */
function formatImapErrorMessage(error: any, settings: EmailSettings): string {
  const msg = error.message || "";
  const code = error.code || "";

  if (msg.includes("authenticate") || msg.includes("command failed") || msg.includes("auth") || code === "AUTHENTICATIONFAILED") {
    if (settings.imapHost?.includes("hostinger")) {
      return (
        "Hostinger IMAP Authentication Failed: Server imap.hostinger.com rejected the credentials. " +
        "Please check: " +
        "(1) Make sure the password is your Email Account password in Hostinger (not your main hPanel account password). " +
        "(2) Test logging in at https://mail.hostinger.com with this exact email and password. " +
        "(3) Ensure username is the full email address."
      );
    }
    return `IMAP authentication failed for ${settings.imapHost}. Please check username and password.`;
  }

  if (code === "ETIMEDOUT" || code === "ESOCKET" || msg.includes("timeout")) {
    return `Connection to IMAP server ${settings.imapHost}:${settings.imapPort} timed out.`;
  }

  return msg || "Failed to authenticate with IMAP server.";
}

/**
 * Tests IMAP server connection and authentication.
 */
export async function verifyImapConnection(settings: EmailSettings): Promise<{
  success: boolean;
  message: string;
  mailboxes?: string[];
}> {
  const client = createImapClient(settings);

  try {
    await client.connect();
    const list = await client.list();
    const mailboxes = (list || []).map((mb) => mb.path);
    await client.logout();

    return {
      success: true,
      message: `IMAP Connected successfully to ${settings.imapHost}:${settings.imapPort}`,
      mailboxes,
    };
  } catch (error: any) {
    console.error("[IMAP Verify Error]:", error);
    try {
      await client.logout();
    } catch {}
    const friendlyMsg = formatImapErrorMessage(error, settings);
    return {
      success: false,
      message: friendlyMsg,
    };
  }
}

/**
 * Synchronizes incoming emails from IMAP inbox into the Firestore database cache.
 */
export async function syncImapInbox(settings: EmailSettings, limit = 20): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  if (!settings.imapEnabled) {
    return { success: false, syncedCount: 0, error: "IMAP incoming synchronization is disabled." };
  }

  const client = createImapClient(settings);
  let syncedCount = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const mailbox = client.mailbox;
      if (!mailbox || mailbox.exists === 0) {
        await client.logout();
        return { success: true, syncedCount: 0 };
      }

      const totalMessages = mailbox.exists;
      const startSeq = Math.max(1, totalMessages - limit + 1);
      const range = `${startSeq}:${totalMessages}`;

      const messagesToProcess = [];

      for await (const message of client.fetch(range, {
        envelope: true,
        flags: true,
        source: true,
        uid: true,
      })) {
        messagesToProcess.push(message);
      }

      for (const msg of messagesToProcess) {
        try {
          if (!msg.source) continue;

          // Parse RFC822 MIME source
          const parsed = await simpleParser(msg.source);

          const messageId = parsed.messageId || `imap-${msg.uid}-${settings.imapHost}`;

          // Avoid duplicate insertion during periodic auto-sync
          const existing = await findEmailByMessageId(messageId);
          if (existing) {
            continue;
          }

          const isSeen = msg.flags?.has("\\Seen") || false;
          const isFlagged = msg.flags?.has("\\Flagged") || false;

          const fromObj = {
            name: parsed.from?.value?.[0]?.name || parsed.from?.text || "Unknown Sender",
            email: parsed.from?.value?.[0]?.address || "unknown@mail.com",
          };

          const toArray = (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : []).flatMap(
            (t) => (t.value || []).map((v) => ({ name: v.name || "", email: v.address || "" }))
          );

          const subject = parsed.subject || "(No Subject)";
          const bodyHtml = (parsed.html as string) || `<p>${parsed.text || ""}</p>`;
          const bodyText = parsed.text || "";
          const snippet = (bodyText || bodyHtml.replace(/<[^>]*>?/gm, "")).slice(0, 140).trim();

          const attachments = (parsed.attachments || []).map((att) => ({
            filename: att.filename || "attachment",
            contentType: att.contentType || "application/octet-stream",
            size: att.size || (att.content ? att.content.length : 0),
            cid: att.cid,
          }));

          // Link conversation thread
          const inReplyTo = parsed.inReplyTo || undefined;
          const references = Array.isArray(parsed.references)
            ? parsed.references
            : parsed.references
            ? [parsed.references]
            : [];
          const conversationId = inReplyTo || messageId;

          try {
            await saveEmailMessageDoc({
              folder: "inbox",
              conversationId,
              from: fromObj,
              to: toArray,
              subject,
              bodyHtml,
              bodyText,
              snippet,
              isRead: isSeen,
              isStarred: isFlagged,
              isImportant: false,
              hasAttachments: attachments.length > 0,
              attachments,
              status: "received",
              messageId,
              inReplyTo: inReplyTo || null,
              references,
              uid: msg.uid,
              createdAt: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            syncedCount++;
          } catch (writeErr) {
            console.warn("[IMAP Sync Save Msg Error]:", writeErr);
          }
        } catch (parseErr) {
          console.warn("[IMAP Single Message Parse Error]:", parseErr);
        }
      }

      // Update last sync in settings
      try {
        await saveStoredEmailSettings({
          ...settings,
          lastSyncAt: new Date().toISOString(),
        });

        await saveEmailLogDoc({
          type: "imap_sync",
          status: "success",
          subject: `Synced ${syncedCount} new messages from IMAP`,
          timestamp: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn("[IMAP Sync Log Error]:", logErr);
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return { success: true, syncedCount };
  } catch (error: any) {
    console.error("[IMAP Sync Error]:", error);
    try {
      await client.logout();
    } catch {}

    try {
      await saveEmailLogDoc({
        type: "imap_sync",
        status: "error",
        errorDetails: error.message || "Unknown IMAP sync failure",
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error("[Log Error]:", logErr);
    }

    return { success: false, syncedCount: 0, error: error.message || "IMAP sync failed" };
  }
}
