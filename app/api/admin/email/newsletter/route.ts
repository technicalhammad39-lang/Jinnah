import { NextResponse } from "next/server";
import { getStoredEmailSettings, getNewsletterData, saveSubscriberDoc, saveNewsletterCampaignDoc } from "@/lib/email/db";
import { sendEmailViaSmtp } from "@/lib/email/smtp";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const { subscribers, campaigns } = await getNewsletterData();

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
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Add Single Subscriber
    if (action === "add_subscriber") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
      }

      await saveSubscriberDoc({
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

      let count = 0;

      for (const item of subscribers) {
        const email = (typeof item === "string" ? item : item.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;

        await saveSubscriberDoc({
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

      return NextResponse.json({ success: true, message: `Successfully imported ${count} subscribers.` });
    }

    // 3. Dispatch Campaign
    if (action === "send_campaign") {
      const { title, subject, bodyHtml } = body;
      if (!subject || !bodyHtml) {
        return NextResponse.json({ error: "Subject and Body HTML are required for campaign" }, { status: 400 });
      }

      const settings = await getStoredEmailSettings();
      if (!settings || !settings.smtpEnabled) {
        return NextResponse.json({ error: "SMTP must be enabled in settings to dispatch campaigns" }, { status: 400 });
      }

      const { subscribers } = await getNewsletterData();
      const activeEmails = subscribers.filter((s: any) => s.status === "subscribed").map((s: any) => s.email).filter(Boolean);

      if (activeEmails.length === 0) {
        return NextResponse.json({ error: "No active subscribers found to send this campaign to." }, { status: 400 });
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of activeEmails) {
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
      const campaignId = await saveNewsletterCampaignDoc({
        title: title || subject,
        subject,
        bodyHtml,
        recipientsCount: activeEmails.length,
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
        id: campaignId,
      });
    }

    return NextResponse.json({ error: "Unknown newsletter action" }, { status: 400 });
  } catch (error: any) {
    console.error("[Newsletter POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process newsletter request" }, { status: 500 });
  }
}
