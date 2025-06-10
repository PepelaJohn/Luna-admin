
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    console.log("No token available")
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '', // Forward cookie to API
      },
    });

    const authResult = await verifyResponse.json();
    

    if (!authResult.success) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/admin') && authResult.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Auth API call failed in middleware:', err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
