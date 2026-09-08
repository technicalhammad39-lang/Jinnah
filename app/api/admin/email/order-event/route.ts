import { NextResponse } from "next/server";
import { handleOrderStatusEmail } from "@/lib/email/automation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order, newStatus } = body;

    if (!order || !newStatus) {
      return NextResponse.json({ error: "Order object and newStatus are required." }, { status: 400 });
    }

    // Trigger transactional email asynchronously
    await handleOrderStatusEmail(order, newStatus);

    return NextResponse.json({ success: true, message: "Order email event dispatched." });
  } catch (error: any) {
    console.error("[Order Event API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to trigger email event." }, { status: 500 });
  }
}
