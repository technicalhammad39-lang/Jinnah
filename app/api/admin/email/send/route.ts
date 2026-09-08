import { NextResponse } from "next/server";
import { getEmailSettings } from "@/lib/email/automation";
import { sendEmailViaSmtp } from "@/lib/email/smtp";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      to,
      cc,
      bcc,
      subject,
      bodyHtml,
      bodyText,
      attachments,
      isDraft,
      scheduledAt,
      conversationId,
      inReplyTo,
    } = body;

    if (!to || (!Array.isArray(to) && typeof to !== "string")) {
      return NextResponse.json({ error: "Recipient 'to' email is required" }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    // 1. Handle Draft Save
    if (isDraft) {
      const draftRef = adminDb.collection("emails").doc();
      const toArray = (Array.isArray(to) ? to : [to]).map((e: string) => ({ email: e }));

      await draftRef.set({
        id: draftRef.id,
        folder: "drafts",
        conversationId: conversationId || `conv-draft-${Date.now()}`,
        from: { name: "Me (Draft)", email: "me" },
        to: toArray,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]).map((e: string) => ({ email: e })) : [],
        subject,
        bodyHtml: bodyHtml || "",
        bodyText: bodyText || "",
        snippet: (bodyText || (bodyHtml || "").replace(/<[^>]*>?/gm, "")).slice(0, 140),
        isRead: true,
        isStarred: false,
        isImportant: false,
        hasAttachments: Boolean(attachments && attachments.length > 0),
        attachments: attachments || [],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: "Draft saved successfully." });
    }

    // 2. Handle Scheduled Send
    if (scheduledAt) {
      const schedRef = adminDb.collection("emails").doc();
      const toArray = (Array.isArray(to) ? to : [to]).map((e: string) => ({ email: e }));

      await schedRef.set({
        id: schedRef.id,
        folder: "scheduled",
        conversationId: conversationId || `conv-sched-${Date.now()}`,
        from: { name: "Me", email: "me" },
        to: toArray,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]).map((e: string) => ({ email: e })) : [],
        subject,
        bodyHtml: bodyHtml || "",
        bodyText: bodyText || "",
        snippet: (bodyText || (bodyHtml || "").replace(/<[^>]*>?/gm, "")).slice(0, 140),
        isRead: true,
        isStarred: false,
        isImportant: false,
        hasAttachments: Boolean(attachments && attachments.length > 0),
        attachments: attachments || [],
        status: "scheduled",
        scheduledAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `Email scheduled for ${new Date(scheduledAt).toLocaleString()}.` });
    }

    // 3. Immediate Send via SMTP
    const settings = await getEmailSettings();
    if (!settings) {
      return NextResponse.json({ error: "Email settings not configured. Please set up SMTP first." }, { status: 400 });
    }

    const result = await sendEmailViaSmtp({
      settings,
      to,
      cc,
      bcc,
      subject,
      html: bodyHtml || `<p>${bodyText || ""}</p>`,
      text: bodyText,
      attachments,
      conversationId,
      inReplyTo,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to dispatch email." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Email dispatched successfully.",
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("[Email Send Route Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
