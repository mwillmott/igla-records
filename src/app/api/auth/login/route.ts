import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
  const mockType = searchParams.get('mock');

  // If developer mock authentication requested
  if (mockType === 'admin' || mockType === 'user') {
    return NextResponse.redirect(new URL(`/api/auth/callback?mock=${mockType}`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback`;

  // If no credentials configured, default to Mock Admin for local testing/deployment stubs
  if (!clientId) {
    console.warn('Google Client ID is missing. Falling back to Developer Simulation Mode.');
    return NextResponse.redirect(new URL(`/api/auth/callback?mock=admin`, origin));
  }

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;

  return NextResponse.redirect(googleUrl);
}
