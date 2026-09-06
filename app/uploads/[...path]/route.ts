import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    if (!segments || segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Candidate root directories to check in order
    const candidateRoots: string[] = [];

    if (process.env.HOSTINGER_UPLOAD_ROOT) {
      candidateRoots.push(path.resolve(process.env.HOSTINGER_UPLOAD_ROOT));
    }

    candidateRoots.push(path.resolve(process.cwd(), '.storage/uploads'));
    candidateRoots.push(path.resolve(process.cwd(), 'uploads'));
    candidateRoots.push(path.resolve(process.cwd(), 'public/uploads'));

    // Check candidate directories for the exact relative path
    let targetFilePath: string | null = null;

    for (const root of candidateRoots) {
      const candidatePath = path.resolve(root, ...segments);

      // Security: Prevent directory traversal attacks
      if (!candidatePath.startsWith(root)) {
        continue;
      }

      if (existsSync(candidatePath)) {
        targetFilePath = candidatePath;
        break;
      }
    }

    // Smart Fallback: If not found in uploads, check if matching base asset exists in public/
    if (!targetFilePath) {
      const requestedFilename = segments[segments.length - 1] || '';
      const publicDir = path.resolve(process.cwd(), 'public');

      // 1. Direct check in public/
      const directPublic = path.resolve(publicDir, requestedFilename);
      if (directPublic.startsWith(publicDir) && existsSync(directPublic)) {
        targetFilePath = directPublic;
      } else {
        // 2. Strip unique hex hash suffix: e.g. "4-sheat-2e7b3d2f485265ac.webp" -> "4-sheat"
        const baseNameMatch = requestedFilename.match(/^(.*?)-[a-f0-9]{16}\.[a-z0-9]+$/i);
        const basePrefix = baseNameMatch ? baseNameMatch[1] : null;

        if (basePrefix) {
          const commonExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.avif', '.svg'];
          for (const ext of commonExtensions) {
            const fallbackPath = path.resolve(publicDir, `${basePrefix}${ext}`);
            if (fallbackPath.startsWith(publicDir) && existsSync(fallbackPath)) {
              targetFilePath = fallbackPath;
              break;
            }
          }
        }
      }
    }

    if (!targetFilePath || !existsSync(targetFilePath)) {
      console.warn(
        `[Upload Route] 404 - File Not Found: /uploads/${segments.join('/')}. ` +
        `Checked HOSTINGER_UPLOAD_ROOT=${process.env.HOSTINGER_UPLOAD_ROOT || 'unset'}, cwd=${process.cwd()}`
      );
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = await fs.readFile(targetFilePath);

    // Determine content type based on extension
    const ext = path.extname(targetFilePath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.avif') contentType = 'image/avif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.ico') contentType = 'image/x-icon';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Upload Route] Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
