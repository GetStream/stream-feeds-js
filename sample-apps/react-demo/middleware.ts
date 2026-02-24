import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * When user_id is not in the URL, call the create-user API on the server to
 * create a user, then redirect to the same path with user_id set. The client
 * then loads with user_id present and does not need to run create-user.
 */
export async function middleware(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id');
  if (userId?.trim()) {
    return NextResponse.next();
  }

  const origin = request.nextUrl.origin;
  try {
    const res = await fetch(`${origin}/api/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      console.warn('[middleware] create-user failed:', res.status);
      return NextResponse.next();
    }
    const data = (await res.json()) as { userId?: string };
    const newUserId = data.userId?.trim();
    if (!newUserId) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.searchParams.set('user_id', newUserId);
    return NextResponse.redirect(url);
  } catch (err) {
    console.warn('[middleware] create-user request failed:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static files and API routes.
     * Skip /api so we don't call create-user from within the API.
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
