import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { DEFAULT_TEMPLATES } from "@/lib/email/templates";
import { EmailTemplate } from "@/lib/email/types";

export async function GET() {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const snapshot = await adminDb.collection("email_templates").get();

    if (snapshot.empty) {
      // Seed default templates
      const batch = adminDb.batch();
      for (const tpl of DEFAULT_TEMPLATES) {
        const docRef = adminDb.collection("email_templates").doc(tpl.id);
        batch.set(docRef, tpl);
      }
      await batch.commit();

      return NextResponse.json({ success: true, templates: DEFAULT_TEMPLATES });
    }

    const templates: EmailTemplate[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("[Email Templates GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const id = body.id || `tpl_${Date.now()}`;
    const docRef = adminDb.collection("email_templates").doc(id);

    const payload: EmailTemplate = {
      id,
      name: body.name || "Untitled Template",
      slug: body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "custom-template",
      subject: body.subject || "",
      category: body.category || "general",
      bodyHtml: body.bodyHtml || "",
      variables: body.variables || ["customer_name", "company_name"],
      isDefault: Boolean(body.isDefault),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(payload, { merge: true });

    return NextResponse.json({ success: true, template: payload });
  } catch (error: any) {
    console.error("[Email Templates POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save template" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: "Server database configuration error" }, { status: 500 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    await adminDb.collection("email_templates").doc(id).delete();
    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("[Email Templates DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
