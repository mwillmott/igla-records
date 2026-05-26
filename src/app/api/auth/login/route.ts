import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mockType = searchParams.get('mock');

  // If developer mock authentication requested
  if (mockType === 'admin' || mockType === 'user') {
    return NextResponse.redirect(new URL(`/api/auth/callback?mock=${mockType}`, request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback`;

  // If no credentials configured, default to Mock Admin for local testing/deployment stubs
  if (!clientId) {
    console.warn('Google Client ID is missing. Falling back to Developer Simulation Mode.');
    return NextResponse.redirect(new URL(`/api/auth/callback?mock=admin`, request.url));
  }

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;

  return NextResponse.redirect(googleUrl);
}
