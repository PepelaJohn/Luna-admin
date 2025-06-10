// @/app/api/auth/change-password/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuthToken(request);
    if (!authResult?.success) {
      return returnError({
        message: 'Unauthorized',
        status: 401,
      });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Verify current password
    const isCurrentPasswordValid = await authResult?.user?.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return returnError({
        message: 'Current password is incorrect',
        status: 400,
      });
    }

    if(!authResult.user) return returnError(
      {
         message: 'Current password is incorrect',
        status: 400,
      }
    )

    // Update password
    authResult.user.password = newPassword;
    authResult.user.passwordChangedAt = new Date();
    
    // Increment session version to invalidate all other sessions
    await authResult?.user?.incrementSessionVersion();
    
    await authResult?.user?.save();

    return returnSuccess({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Password change failed',
      error,
      status: 500,
    });
  }
}