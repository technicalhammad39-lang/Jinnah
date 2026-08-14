import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    
    if (!segments || segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const uploadRoot = process.env.HOSTINGER_UPLOAD_ROOT || path.join(process.cwd(), ".storage/uploads");
    const filePath = path.join(uploadRoot, ...segments);

    // Security: Prevent directory traversal attacks
    if (!filePath.startsWith(uploadRoot)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.avif') contentType = 'image/avif';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e) {
      return new NextResponse('File Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
