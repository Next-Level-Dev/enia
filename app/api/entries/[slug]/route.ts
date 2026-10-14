import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import {
  deleteEntry,
  getEntryBySlug,
  setEntryPublished,
  updateEntry,
  validateEntryInput,
} from '@/lib/db';
import { deletePdf } from '@/lib/uploads';

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/entries/[slug]'>) {
  const { slug } = await ctx.params;
  const entry = getEntryBySlug(slug);
  if (!entry || !entry.published) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }
  return NextResponse.json({ entry });
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/entries/[slug]'>) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let input;
  try {
    input = validateEntryInput(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid entry data';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const previous = getEntryBySlug(slug);

  const entry = updateEntry(slug, input);
  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  if (previous) {
    if (previous.pdf && previous.pdf !== input.pdf) await deletePdf(previous.pdf);
    if (previous.tr?.pdf && previous.tr.pdf !== input.tr.pdf) await deletePdf(previous.tr.pdf);
  }

  return NextResponse.json({ entry });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/entries/[slug]'>) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const published = (body as Record<string, unknown>)?.published === true;
  const entry = setEntryPublished(slug, published);
  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }
  return NextResponse.json({ entry });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/entries/[slug]'>) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const previous = getEntryBySlug(slug);
  const deleted = deleteEntry(slug);
  if (!deleted) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  if (previous) {
    await deletePdf(previous.pdf);
    await deletePdf(previous.tr?.pdf);
  }

  return new NextResponse(null, { status: 204 });
}
