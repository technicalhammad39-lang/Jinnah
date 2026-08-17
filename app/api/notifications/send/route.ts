import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { title, body, link } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 }
      );
    }

    if (!adminApp) {
      console.error("Firebase Admin is missing.");
      return NextResponse.json(
        { error: "Firebase Admin is not configured. Missing Service Account Key." },
        { status: 500 }
      );
    }

    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          link: link || "/",
        },
      },
      topic: "all", // Sending to everyone subscribed to "all" topic
    };

    const response = await getMessaging(adminApp).send(message);
    
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification." },
      { status: 500 }
    );
  }
}
