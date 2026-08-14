import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export interface UploadResult {
  url: string;
  size: number;
  width?: number;
  height?: number;
}

export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<UploadResult> {
  const uploadRoot =
    process.env.HOSTINGER_UPLOAD_ROOT || path.join(process.cwd(), "public/uploads");
  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/uploads";

  // Validate MIME type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only images are allowed.");
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "bin";
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const sanitizedName = file.name
    .replace(`.${ext}`, "")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
  
  // We'll convert non-svg images to webp for optimization
  const isSvg = file.type === "image/svg+xml";
  const finalExt = isSvg ? "svg" : "webp";
  const filename = `${sanitizedName}-${uniqueId}.${finalExt}`;
  
  const targetDir = path.join(uploadRoot, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  let finalBuffer = buffer;
  let metadata: sharp.Metadata | null = null;

  if (!isSvg) {
    const image = sharp(buffer);
    metadata = await image.metadata();
    
    // Convert to webp and optimize
    finalBuffer = await image
      .webp({ quality: 80 })
      .resize({
        width: metadata.width && metadata.width > 2000 ? 2000 : undefined,
        withoutEnlargement: true,
      })
      .toBuffer();
    
    // Update metadata after resize
    metadata = await sharp(finalBuffer).metadata();
  }

  await fs.writeFile(targetPath, finalBuffer);

  const url = `${baseUrl}/${folder}/${filename}`;

  return {
    url,
    size: finalBuffer.length,
    width: metadata?.width,
    height: metadata?.height,
  };
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    const uploadRoot =
      process.env.HOSTINGER_UPLOAD_ROOT || path.join(process.cwd(), "public/uploads");
    const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/uploads";

    if (!url.startsWith(baseUrl)) {
      return false; // Not a local upload
    }

    const relativePath = url.slice(baseUrl.length);
    const absolutePath = path.join(uploadRoot, relativePath);

    await fs.unlink(absolutePath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
