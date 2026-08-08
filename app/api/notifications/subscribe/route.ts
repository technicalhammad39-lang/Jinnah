import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { adminApp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required." },
        { status: 400 }
      );
    }

    if (!adminApp) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured. Missing Service Account Key." },
        { status: 500 }
      );
    }

    // Subscribe the device token to the "all" topic
    const response = await getMessaging(adminApp).subscribeToTopic([token], "all");
    
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error subscribing to topic:", error);
    return NextResponse.json(
      { error: error.message || "Failed to subscribe to topic." },
      { status: 500 }
    );
  }
}
