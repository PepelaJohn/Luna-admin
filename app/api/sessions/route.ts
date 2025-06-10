// @/app/api/auth/sessions/route.ts (Session management)
import { NextRequest } from 'next/server';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';

async function invalidateAllSessionsHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const user = (request as any).user;
    
    // Increment session version to invalidate all sessions
    await user.incrementSessionVersion();

    return returnSuccess({
      message: 'All sessions invalidated successfully',
    });
  } catch (error: any) {
    return returnError({
      message: 'Failed to invalidate sessions',
      error,
      status: 500,
    });
  }
}

export const POST = withAuth(invalidateAllSessionsHandler);
