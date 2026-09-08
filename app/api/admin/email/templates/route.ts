import { NextResponse } from "next/server";
import { EmailTemplate } from "@/lib/email/types";
import { getEmailTemplatesList, saveEmailTemplateDoc, deleteEmailTemplateDoc } from "@/lib/email/db";

export async function GET() {
  try {
    const templates = await getEmailTemplatesList();
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("[Email Templates GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `tpl_${Date.now()}`;

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

    await saveEmailTemplateDoc(payload);

    return NextResponse.json({ success: true, template: payload });
  } catch (error: any) {
    console.error("[Email Templates POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save template" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    await deleteEmailTemplateDoc(id);
    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("[Email Templates DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
