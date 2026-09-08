import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { EmailLog } from "@/lib/email/types";

export async function GET(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(150, Math.max(1, Number(searchParams.get("limit")) || 60));
    const statusFilter = searchParams.get("status");

    let queryRef: any = adminDb.collection("email_logs").orderBy("timestamp", "desc").limit(limit);

    if (statusFilter && statusFilter !== "all") {
      queryRef = queryRef.where("status", "==", statusFilter);
    }

    const snapshot = await queryRef.get();
    const logs: EmailLog[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("[Email Logs GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to query email logs" }, { status: 500 });
  }
}
