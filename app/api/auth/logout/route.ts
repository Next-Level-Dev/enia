import { NextResponse, type NextRequest } from 'next/server';
import { deleteSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
