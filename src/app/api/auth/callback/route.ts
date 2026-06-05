import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encryptSession, UserSession } from '@/lib/auth';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
  const mockType = searchParams.get('mock');
  const code = searchParams.get('code');

  let sessionUser: UserSession | null = null;

  // 1. Handle Developer Mock Login
  if (mockType === 'admin') {
    sessionUser = {
      email: 'admin@igla.org',
      name: 'Alex Mercer (Admin)',
      avatar: 'AM',
      role: 'admin'
    };
  } else if (mockType === 'user') {
    sessionUser = {
      email: 'swimmer@gmail.com',
      name: 'Jordan Smith',
      avatar: 'JS',
      role: 'user'
    };
  }
  // 2. Handle Google OAuth Callback
  else if (code) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback`;

    if (clientId && clientSecret) {
      try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          // Fetch user profile info
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          const userData = await userResponse.json();

          if (userData.email) {
            const email = userData.email;
            // Admin holds @igla.org email domain
            const role = email.endsWith('@igla.org') ? 'admin' : 'user';
            
            // Get initials for Avatar
            const initials = userData.name
              ? userData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : email.slice(0, 2).toUpperCase();

            sessionUser = {
              email,
              name: userData.name || email,
              avatar: initials,
              role
            };
          }
        }
      } catch (err) {
        console.error('Error during Google OAuth exchange:', err);
      }
    }
  }

  // 3. Set Session and Redirect
  if (sessionUser) {
    const encrypted = encryptSession(sessionUser);
    const cookieStore = await cookies();
    
    // Set secure HttpOnly cookie for 7 days
    cookieStore.set('igla_session', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Redirect to Admin dashboard if Admin, otherwise Results
    const redirectPath = sessionUser.role === 'admin' ? '/admin' : '/results';
    return NextResponse.redirect(new URL(redirectPath, origin));
  }

  // Fallback if auth fails
  return NextResponse.redirect(new URL('/results?auth_error=true', origin));
}
