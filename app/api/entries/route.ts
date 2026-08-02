import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import { createEntry, listEntries, validateEntryInput, type ListOptions } from '@/lib/db';
import {
  CATEGORY_TAGS,
  isCategory,
  isPerspective,
  type Category,
  type Perspective,
} from '@/lib/categories';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const categoryParam = searchParams.get('category');
  const category = isCategory(categoryParam ?? undefined) ? (categoryParam as Category) : undefined;

  const perspectiveParam = searchParams.get('perspective');
  const perspective = isPerspective(perspectiveParam ?? undefined)
    ? (perspectiveParam as Perspective)
    : undefined;

  const tag = searchParams.get('tag') ?? undefined;
  if (category && tag && !CATEGORY_TAGS[category].includes(tag)) {
    return NextResponse.json({ error: `Tag "${tag}" is not valid for this category` }, { status: 400 });
  }

  const sortParam = searchParams.get('sort');
  const sort = sortParam === 'edited' ? ('edited' as const) : ('release' as const);

  const orderParam = searchParams.get('order');
  const order = orderParam === 'asc' ? ('asc' as const) : ('desc' as const);

  const options: ListOptions = { category, perspective, tag, sort, order };
  const entries = listEntries(options);

  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const entry = createEntry(input);
  return NextResponse.json({ entry }, { status: 201 });
}
