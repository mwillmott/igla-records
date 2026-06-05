import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  const cookieStore = await cookies();
  cookieStore.delete('igla_session');
  return NextResponse.redirect(new URL('/results', origin));
}
