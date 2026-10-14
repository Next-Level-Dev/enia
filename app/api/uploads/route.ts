import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import { savePdf } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = getSessionUser(token);
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const saved = await savePdf(file);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
