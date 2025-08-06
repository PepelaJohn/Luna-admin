// @/app/api/user/profile/route.ts (User profile management)
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

async function getProfileHandler(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    return returnSuccess({
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    return returnError({
      message: 'Failed to get profile',
      error,
      status: 500,
    });
  }
}

async function updateProfileHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const user = (request as any).user;
    const body = await request.json();
    const updateData = updateProfileSchema.parse(body);

    // Update user profile
    Object.assign(user, updateData);
    await user.save();

    return returnSuccess({
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
      },
      message: 'Profile updated successfully',
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
      message: 'Failed to update profile',
      error,
      status: 500,
    });
  }
}

export const GET = withAuth(getProfileHandler);
export const PUT = withAuth(updateProfileHandler);