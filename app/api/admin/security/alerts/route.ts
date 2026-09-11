import { NextResponse } from "next/server";
import { verifyAdminRequest, adminUnauthorizedResponse } from "@/lib/admin-auth-guard";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { SecurityAlert } from "@/lib/security/types";

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success || !authResult.admin) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const snap = await adminDb
      .collection("security_alerts")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const alerts: SecurityAlert[] = snap.docs.map((d) => d.data() as SecurityAlert);
    const unresolvedCount = alerts.filter((a) => a.status === "unresolved").length;

    return NextResponse.json({
      success: true,
      alerts,
      unresolvedCount,
    });
  } catch (err: any) {
    console.error("[SecurityAlerts API Error]:", err);
    return NextResponse.json({ error: "Failed to load security alerts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success || !authResult.admin) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const alertId = typeof body.alertId === "string" ? body.alertId.trim() : "";
    const newStatus = body.status === "investigating" ? "investigating" : "resolved";

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const docRef = adminDb.collection("security_alerts").doc(alertId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await docRef.update({
      status: newStatus,
      resolvedAt: new Date().toISOString(),
      resolvedBy: authResult.admin.email || authResult.admin.uid,
    });

    return NextResponse.json({
      success: true,
      message: `Alert marked as ${newStatus}`,
    });
  } catch (err: any) {
    console.error("[SecurityAlerts Resolve Error]:", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
