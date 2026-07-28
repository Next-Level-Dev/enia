import { NextResponse } from 'next/server';

export async function GET() {
  const data = { message: 'Hello from the API!' };
  
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  // Do something with the data here

  return NextResponse.json(
    { success: true, receivedName: name },
    { status: 201 }
  );
}
