import { NextResponse, type NextRequest } from 'next/server';
import { MAX_QUERY_LENGTH, searchAll } from '@/lib/search';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length === 0) {
    return NextResponse.json({ hits: [] });
  }

  const hits = searchAll(query.slice(0, MAX_QUERY_LENGTH));
  return NextResponse.json({ hits });
}