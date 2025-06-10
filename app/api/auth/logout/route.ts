
// @/app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuthToken(request);
    if ( !authResult.success) {
      return returnError({
        message: 'Unauthorized',
        status: 401,
      });
    }

    // Increment session version to invalidate all sessions
    await authResult?.user?.incrementSessionVersion();

    const response = returnSuccess({
      message: 'Logout successful',
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return returnError({
      message: 'Logout failed',
      error,
      status: 500,
    });
  }
}
