import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import { isPdfReferencedByPublishedEntry } from '@/lib/db';
import { isValidPdfName, readPdf, PDF_MIME } from '@/lib/uploads';

export async function GET(request: NextRequest, ctx: RouteContext<'/api/pdf/[name]'>) {
  const { name } = await ctx.params;
  if (!isValidPdfName(name)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAdmin = !!getSessionUser(token)?.isAdmin;
  const isPublic = isAdmin ? false : isPdfReferencedByPublishedEntry(name);
  if (!isAdmin && !isPublic) {
    return new NextResponse('Not found', { status: 404 });
  }

  const data = await readPdf(name);
  if (!data) {
    return new NextResponse('Not found', { status: 404 });
  }

  const total = data.length;
  const headers = new Headers({
    'Content-Type': PDF_MIME,
    'Content-Disposition': `inline; filename="${name}"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
  });

  const range = request.headers.get('range');
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match && (match[1] || match[2])) {
      let start: number;
      let end: number;
      if (match[1]) {
        start = Number.parseInt(match[1], 10);
        end = match[2] ? Number.parseInt(match[2], 10) : total - 1;
      } else {
        const suffix = Number.parseInt(match[2], 10);
        start = Math.max(total - suffix, 0);
        end = total - 1;
      }

      if (start > end || start >= total) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${total}` },
        });
      }
      end = Math.min(end, total - 1);

      const chunk = data.subarray(start, end + 1);
      headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
      headers.set('Content-Length', String(chunk.length));
      return new NextResponse(new Uint8Array(chunk), { status: 206, headers });
    }
  }

  headers.set('Content-Length', String(total));
  return new NextResponse(new Uint8Array(data), { headers });
}
