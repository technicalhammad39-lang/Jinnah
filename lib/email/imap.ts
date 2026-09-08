import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { EmailSettings, EmailMessage } from "./types";
import { decryptCredential } from "./crypto";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";

/**
 * Creates an ImapFlow client instance using EmailSettings.
 */
export function createImapClient(settings: EmailSettings) {
  if (!settings.imapHost || !settings.imapUser) {
    throw new Error("IMAP Host and Username are required.");
  }

  const plainPassword = decryptCredential(settings.imapPassword);

  return new ImapFlow({
    host: settings.imapHost,
    port: Number(settings.imapPort) || 993,
    secure: Boolean(settings.imapSecure), // true for 993
    auth: {
      user: settings.imapUser,
      pass: plainPassword,
    },
    logger: false,
    tls: {
      rejectUnauthorized: false, // Prevents certificate chain issues on custom cPanel / Hostinger mail servers
    },
  });
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
    return {
      success: false,
      message: error.message || "Failed to authenticate with IMAP server.",
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

      const app = getAdminApp();

      for (const msg of messagesToProcess) {
        try {
          if (!msg.source) continue;

          // Parse RFC822 MIME source
          const parsed = await simpleParser(msg.source);

          const messageId = parsed.messageId || `imap-${msg.uid}-${settings.imapHost}`;
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

          const conversationId = inReplyTo || references[0] || messageId;

          if (app) {
            // Check if email with this messageId already exists in Firestore
            const existingQuery = await adminDb
              .collection("emails")
              .where("messageId", "==", messageId)
              .limit(1)
              .get();

            if (!existingQuery.empty) {
              // Update read/starred flags only
              const docId = existingQuery.docs[0].id;
              await adminDb.collection("emails").doc(docId).update({
                isRead: isSeen,
                isStarred: isFlagged,
                updatedAt: new Date().toISOString(),
              });
            } else {
              // Insert new message
              const docRef = adminDb.collection("emails").doc();
              await docRef.set({
                id: docRef.id,
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
            }
          }
        } catch (parseErr) {
          console.warn("[IMAP Single Message Parse Error]:", parseErr);
        }
      }

      // Update last sync in settings
      if (app) {
        await adminDb.collection("email_settings").doc("main").set(
          { lastSyncAt: new Date().toISOString() },
          { merge: true }
        );

        await adminDb.collection("email_logs").add({
          type: "imap_sync",
          status: "success",
          subject: `Synced ${syncedCount} new messages from IMAP`,
          timestamp: new Date().toISOString(),
        });
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

    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_logs").add({
        type: "imap_sync",
        status: "error",
        errorDetails: error.message || "Unknown IMAP sync failure",
        timestamp: new Date().toISOString(),
      });
    }

    return { success: false, syncedCount: 0, error: error.message || "IMAP sync failed" };
  }
}
