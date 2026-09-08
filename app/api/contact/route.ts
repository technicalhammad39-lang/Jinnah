import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { handleContactFormSubmission } from "@/lib/email/automation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, subject } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const app = getAdminApp();
    if (app) {
      // 1. Save to messages collection
      await adminDb.collection("messages").add({
        name,
        email,
        phone: phone || "",
        message,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // 2. Add to Email Center inbox & send auto-acknowledgement via SMTP if active
      await handleContactFormSubmission({
        name,
        email,
        phone,
        message,
        subject,
      });
    }

    return NextResponse.json({ success: true, message: "Inquiry received successfully." });
  } catch (error: any) {
    console.error("[Contact API Route Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process message." }, { status: 500 });
  }
}
