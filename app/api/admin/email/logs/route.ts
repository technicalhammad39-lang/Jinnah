import { NextResponse } from "next/server";
import { getEmailLogsList } from "@/lib/email/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(150, Math.max(1, Number(searchParams.get("limit")) || 60));
    const statusFilter = searchParams.get("status") || "all";

    const logs = await getEmailLogsList(statusFilter, limit);

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("[Email Logs GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to query email logs" }, { status: 500 });
  }
}
