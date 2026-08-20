import { NextResponse } from "next/server";
import webpush from "web-push";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";

let isWebPushConfigured = false;

export async function POST(req: Request) {
  try {
    if (!isWebPushConfigured) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      
      if (publicKey && privateKey) {
        webpush.setVapidDetails(
          "mailto:contact@jinnahhardware.com",
          publicKey,
          privateKey
        );
        isWebPushConfigured = true;
      } else {
        console.warn("VAPID keys not configured, push notifications won't work");
      }
    }
    
    let data;
    try {
      data = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body provided. Please make sure you are sending a valid payload." }, { status: 400 });
    }
    const { title, body, link, icon } = data;

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 }
      );
    }

    const app = getAdminApp();
    if (!app) {
      console.error("[Notifications/Send] Firebase Admin is not configured.");
      return NextResponse.json(
        { error: "Firebase Admin is not configured. Notifications require server-side Firebase." },
        { status: 503 }
      );
    }

    const db = getFirestore(app);
    const subscriptionsSnapshot = await db.collection("subscriptions").get();
    
    if (subscriptionsSnapshot.empty) {
      return NextResponse.json({ success: true, message: "No subscribers found." });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: link || "/",
      icon: icon || "/jinnah-logo.webp"
    });

    const sendPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data();
      try {
        await webpush.sendNotification(subscription as any, payload);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription has expired or is no longer valid, delete it
          await doc.ref.delete();
        } else {
          console.error("Error sending notification to subscriber:", err);
        }
      }
    });

    await Promise.all(sendPromises);
    
    return NextResponse.json({ success: true, sent: subscriptionsSnapshot.size });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification." },
      { status: 500 }
    );
  }
}
