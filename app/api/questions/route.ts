import { NextResponse, type NextRequest } from 'next/server';
import {
  QUESTION_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  QUESTION_NAME_MAX_LENGTH,
  RateLimitedError,
  checkQuestionRateLimit,
  createQuestion,
  hashIp,
  recordQuestionSubmission,
} from '@/lib/questions';

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.website === 'string' && raw.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, QUESTION_NAME_MAX_LENGTH) : '';
  const question = typeof raw.question === 'string' ? raw.question.trim() : '';

  if (question.length === 0) {
    return NextResponse.json({ error: 'required' }, { status: 400 });
  }
  if (question.length < QUESTION_MIN_LENGTH) {
    return NextResponse.json({ error: 'too_short' }, { status: 400 });
  }
  if (question.length > QUESTION_MAX_LENGTH) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(request));
  try {
    checkQuestionRateLimit(ipHash);
  } catch (error) {
    if (error instanceof RateLimitedError) {
      return NextResponse.json(
        { error: 'rate_limited', retryAfterSeconds: error.retryAfterSeconds },
        { status: 429 }
      );
    }
    throw error;
  }

  recordQuestionSubmission(ipHash);
  createQuestion({ name, question });
  return NextResponse.json({ ok: true }, { status: 201 });
}