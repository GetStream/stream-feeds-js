import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  } else {
    return NextResponse.next();
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher:
    '/((?!login|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
};
