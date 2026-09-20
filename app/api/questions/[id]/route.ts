import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import {
  QUESTION_ANSWER_MAX_LENGTH,
  QUESTION_MAX_LENGTH,
  QUESTION_NAME_MAX_LENGTH,
  deleteQuestion,
  setQuestionPublished,
  updateQuestion,
} from '@/lib/questions';

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  return !!user?.isAdmin;
}

async function parseId(ctx: RouteContext<'/api/questions/[id]'>): Promise<number | null> {
  const { id } = await ctx.params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/questions/[id]'>) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await parseId(ctx);
  if (!id) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, QUESTION_NAME_MAX_LENGTH) : '';
  const question = typeof raw.question === 'string' ? raw.question.trim() : '';
  const answer = typeof raw.answer === 'string' ? raw.answer.slice(0, QUESTION_ANSWER_MAX_LENGTH) : '';

  if (question.length === 0 || question.length > QUESTION_MAX_LENGTH) {
    return NextResponse.json({ error: 'question' }, { status: 400 });
  }

  const questionRow = updateQuestion(id, {
    name,
    question,
    answer: answer.trim(),
    published: raw.published === true,
  });
  if (!questionRow) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  return NextResponse.json({ question: questionRow });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/questions/[id]'>) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await parseId(ctx);
  if (!id) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const published = (body as Record<string, unknown>)?.published === true;
  if (!setQuestionPublished(id, published)) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/questions/[id]'>) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await parseId(ctx);
  if (!id) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  if (!deleteQuestion(id)) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}