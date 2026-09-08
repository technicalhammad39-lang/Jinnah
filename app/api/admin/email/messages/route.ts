import { NextResponse } from "next/server";
import { EmailFolder } from "@/lib/email/types";
import { getEmailMessages, updateEmailMessagesBatch, deleteEmailMessagesBatch } from "@/lib/email/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get("folder") || "inbox") as EmailFolder;
    const search = (searchParams.get("search") || "").trim();
    const isStarred = searchParams.get("starred") === "true";
    const isImportant = searchParams.get("important") === "true";
    const limitCount = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));

    const { messages, folderCounts } = await getEmailMessages({
      folder,
      search,
      isStarred,
      isImportant,
      limitCount,
    });

    return NextResponse.json({
      success: true,
      messages,
      folderCounts,
    });
  } catch (error: any) {
    console.error("[Email Messages GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to query emails" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { ids, action, targetFolder } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Message IDs array is required" }, { status: 400 });
    }

    let updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    switch (action) {
      case "mark_read":
        updates.isRead = true;
        break;
      case "mark_unread":
        updates.isRead = false;
        break;
      case "star":
        updates.isStarred = true;
        break;
      case "unstar":
        updates.isStarred = false;
        break;
      case "important":
        updates.isImportant = true;
        break;
      case "unimportant":
        updates.isImportant = false;
        break;
      case "move":
        if (targetFolder) updates.folder = targetFolder;
        break;
      case "trash":
        updates.folder = "trash";
        break;
      case "restore":
        updates.folder = "inbox";
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await updateEmailMessagesBatch(ids, updates);

    return NextResponse.json({ success: true, message: `Action '${action}' applied to ${ids.length} emails.` });
  } catch (error: any) {
    console.error("[Email Messages PATCH Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update emails" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Message IDs array is required" }, { status: 400 });
    }

    await deleteEmailMessagesBatch(ids);

    return NextResponse.json({ success: true, message: `Permanently deleted ${ids.length} emails.` });
  } catch (error: any) {
    console.error("[Email Messages DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete emails" }, { status: 500 });
  }
}
