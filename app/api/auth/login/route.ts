import { NextResponse, type NextRequest } from 'next/server';
import { createSession, findUserByCredentials, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;
  const cleanUsername = typeof username === 'string' ? username.trim() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanUsername || !cleanPassword) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = findUserByCredentials(cleanUsername, cleanPassword);
  if (!user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const { token, expiresAt } = createSession(user.id);
  const response = NextResponse.json({ success: true, user });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  });
  return response;
}
