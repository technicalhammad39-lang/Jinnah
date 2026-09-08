import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { getEmailSettings } from "@/lib/email/automation";
import { sendEmailViaSmtp } from "@/lib/email/smtp";

export async function GET() {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const [subscribersSnap, campaignsSnap] = await Promise.all([
      adminDb.collection("email_subscribers").orderBy("subscribedAt", "desc").limit(200).get(),
      adminDb.collection("email_newsletters").orderBy("createdAt", "desc").limit(50).get(),
    ]);

    const subscribers = subscribersSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const campaigns = campaignsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      subscribers,
      campaigns,
      totalSubscribers: subscribers.length,
    });
  } catch (error: any) {
    console.error("[Newsletter GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to load newsletter data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Add Single Subscriber
    if (action === "add_subscriber") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
      }

      const docRef = adminDb.collection("email_subscribers").doc(email);
      await docRef.set({
        id: email,
        email,
        name: body.name || "",
        status: "subscribed",
        tags: body.tags || ["general"],
        source: body.source || "admin_manual",
        subscribedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `Subscriber ${email} added.` });
    }

    // 2. Import Multiple Subscribers (from CSV or JSON array)
    if (action === "import_subscribers") {
      const { subscribers = [] } = body;
      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        return NextResponse.json({ error: "Subscribers array is required" }, { status: 400 });
      }

      const batch = adminDb.batch();
      let count = 0;

      for (const item of subscribers) {
        const email = (typeof item === "string" ? item : item.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;

        const docRef = adminDb.collection("email_subscribers").doc(email);
        batch.set(docRef, {
          id: email,
          email,
          name: typeof item === "object" ? item.name || "" : "",
          status: "subscribed",
          tags: ["imported"],
          source: "csv_import",
          subscribedAt: new Date().toISOString(),
        });
        count++;
      }

      await batch.commit();
      return NextResponse.json({ success: true, message: `Successfully imported ${count} subscribers.` });
    }

    // 3. Dispatch Campaign
    if (action === "send_campaign") {
      const { title, subject, bodyHtml } = body;
      if (!subject || !bodyHtml) {
        return NextResponse.json({ error: "Subject and Body HTML are required for campaign" }, { status: 400 });
      }

      const settings = await getEmailSettings();
      if (!settings || !settings.smtpEnabled) {
        return NextResponse.json({ error: "SMTP must be enabled in settings to dispatch campaigns" }, { status: 400 });
      }

      // Fetch active subscribers
      const subSnap = await adminDb
        .collection("email_subscribers")
        .where("status", "==", "subscribed")
        .limit(500)
        .get();

      const emails = subSnap.docs.map((d: any) => d.data().email).filter(Boolean);

      if (emails.length === 0) {
        return NextResponse.json({ error: "No active subscribers found to send this campaign to." }, { status: 400 });
      }

      // Send to recipients (batches or individual)
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of emails) {
        try {
          const res = await sendEmailViaSmtp({
            settings,
            to: recipient,
            subject,
            html: bodyHtml,
          });
          if (res.success) sentCount++;
          else failedCount++;
        } catch {
          failedCount++;
        }
      }

      // Record Campaign Record
      const campRef = adminDb.collection("email_newsletters").doc();
      await campRef.set({
        id: campRef.id,
        title: title || subject,
        subject,
        bodyHtml,
        recipientsCount: emails.length,
        status: "sent",
        sentAt: new Date().toISOString(),
        stats: {
          sent: sentCount,
          failed: failedCount,
        },
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `Campaign dispatched to ${sentCount} subscribers (${failedCount} failed).`,
      });
    }

    return NextResponse.json({ error: "Unknown newsletter action" }, { status: 400 });
  } catch (error: any) {
    console.error("[Newsletter POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process newsletter request" }, { status: 500 });
  }
}
