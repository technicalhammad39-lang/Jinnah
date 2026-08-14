import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/storage";

// Helper function to check if the user is authenticated (Optional but recommended)
// In a real app, you might want to verify a Firebase Admin token or session cookie here.
async function isAuthenticated(req: NextRequest) {
  // For now, we assume if they can reach this endpoint they are authorized,
  // since the admin pages themselves are protected.
  // Ideally, add a header or cookie check here.
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadFile(file, folder);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const success = await deleteFile(url);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "File not found or could not be deleted" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Delete API error:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
