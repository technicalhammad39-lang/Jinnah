import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Valid subscription object is required." },
        { status: 400 }
      );
    }

    if (!adminApp) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured." },
        { status: 500 }
      );
    }

    const db = getFirestore(adminApp);
    
    // We use the endpoint as a unique identifier to prevent duplicates
    // since endpoints are unique per device/browser.
    // However, endpoints can be URLs, so we'll hash it or just use it to query.
    // Let's just create a unique document.
    
    const subsRef = db.collection("subscriptions");
    const existing = await subsRef.where("endpoint", "==", subscription.endpoint).get();
    
    if (!existing.empty) {
      // Already subscribed
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    await subsRef.add({
      ...subscription,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error: any) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save subscription." },
      { status: 500 }
    );
  }
}
