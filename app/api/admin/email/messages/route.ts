import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { EmailMessage, EmailFolder } from "@/lib/email/types";

export async function GET(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get("folder") || "inbox") as EmailFolder;
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const isStarred = searchParams.get("starred") === "true";
    const isImportant = searchParams.get("important") === "true";
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));

    // Fetch messages from Firestore
    let queryRef: any = adminDb.collection("emails");

    if (isStarred || folder === "starred") {
      queryRef = queryRef.where("isStarred", "==", true);
    } else if (isImportant || folder === "important") {
      queryRef = queryRef.where("isImportant", "==", true);
    } else {
      queryRef = queryRef.where("folder", "==", folder);
    }

    queryRef = queryRef.orderBy("createdAt", "desc").limit(limit);

    const snapshot = await queryRef.get();
    let messages: EmailMessage[] = snapshot.docs.map((doc: any) => ({
      dbKey: doc.id,
      ...doc.data(),
    }));

    // Client-level text search filter if provided
    if (search) {
      messages = messages.filter((m) => {
        const fromStr = `${m.from?.name || ""} ${m.from?.email || ""}`.toLowerCase();
        const toStr = (m.to || []).map((t) => `${t.name || ""} ${t.email || ""}`).join(" ").toLowerCase();
        const subjectStr = (m.subject || "").toLowerCase();
        const snippetStr = (m.snippet || "").toLowerCase();
        return (
          fromStr.includes(search) ||
          toStr.includes(search) ||
          subjectStr.includes(search) ||
          snippetStr.includes(search)
        );
      });
    }

    // Compute unread counts for folders
    const countsSnapshot = await adminDb.collection("emails").where("isRead", "==", false).get();
    const folderUnreadCounts: Record<string, number> = {
      inbox: 0,
      sent: 0,
      drafts: 0,
      outbox: 0,
      scheduled: 0,
      starred: 0,
      important: 0,
      spam: 0,
      archive: 0,
      trash: 0,
    };

    countsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const f = data.folder || "inbox";
      if (folderUnreadCounts[f] != null) {
        folderUnreadCounts[f]++;
      }
    });

    return NextResponse.json({
      success: true,
      messages,
      folderCounts: folderUnreadCounts,
    });
  } catch (error: any) {
    console.error("[Email Messages GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to query emails" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const { ids, action, targetFolder } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Message IDs array is required" }, { status: 400 });
    }

    const batch = adminDb.batch();

    for (const id of ids) {
      const docRef = adminDb.collection("emails").doc(id);

      switch (action) {
        case "mark_read":
          batch.update(docRef, { isRead: true, updatedAt: new Date().toISOString() });
          break;
        case "mark_unread":
          batch.update(docRef, { isRead: false, updatedAt: new Date().toISOString() });
          break;
        case "star":
          batch.update(docRef, { isStarred: true, updatedAt: new Date().toISOString() });
          break;
        case "unstar":
          batch.update(docRef, { isStarred: false, updatedAt: new Date().toISOString() });
          break;
        case "important":
          batch.update(docRef, { isImportant: true, updatedAt: new Date().toISOString() });
          break;
        case "unimportant":
          batch.update(docRef, { isImportant: false, updatedAt: new Date().toISOString() });
          break;
        case "move":
          if (targetFolder) {
            batch.update(docRef, { folder: targetFolder, updatedAt: new Date().toISOString() });
          }
          break;
        case "trash":
          batch.update(docRef, { folder: "trash", updatedAt: new Date().toISOString() });
          break;
        case "restore":
          batch.update(docRef, { folder: "inbox", updatedAt: new Date().toISOString() });
          break;
      }
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: `Action '${action}' applied to ${ids.length} emails.` });
  } catch (error: any) {
    console.error("[Email Messages PATCH Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update emails" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Message IDs array is required" }, { status: 400 });
    }

    const batch = adminDb.batch();
    for (const id of ids) {
      const docRef = adminDb.collection("emails").doc(id);
      batch.delete(docRef);
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: `Permanently deleted ${ids.length} emails.` });
  } catch (error: any) {
    console.error("[Email Messages DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete emails" }, { status: 500 });
  }
}
