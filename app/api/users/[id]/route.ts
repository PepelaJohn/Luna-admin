
// @/app/api/admin/users/[id]/route.ts (Update/Delete user - Admin only)
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import { User as UserTpe } from '@/lib/types';
import { Logger } from '@/lib/logger';

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.enum(['normal', 'corporate', 'admin']).optional(),
  isEmailVerified: z.boolean().optional(),
});

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             
             'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  return { ip, userAgent };
}

async function updateUserHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const updateData = updateUserSchema.parse(body);
    
    const user = await User.findById(params.id);
    if (!user) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    return returnSuccess({
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      message: 'User updated successfully',
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
      message: 'Failed to update user',
      error,
      status: 500,
    });
  }
}
async function deleteUserHandler(request: NextRequest) {
  try {
    await connectDB();
    // const body = await request.json();
    const reason = ""
    
    const userId = request.url.split('/').pop()

     const userToDelete:UserTpe = await User.findById(userId).lean() as any;
    if (!userToDelete) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }
    if (!userId) {
      return returnError({
        message: 'User ID is required',
        status: 400,
      });
    }

     if((userId === userToDelete._id)){
      return returnError({
        message:"You cannot delete yourself"
      })
    }

    // Don't allow deleting the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return returnError({
          message: 'Cannot delete the last admin user',
          status: 400,
        });
      }
    }
    
    // Get user data before deletion for logging
   

    // Prevent deletion of super_admin by non-super_admin
    const performingUser = (request as any).user;
    if (userToDelete.role === 'super_admin' && performingUser.role !== 'super_admin') {
      return returnError({
        message: 'Cannot delete super admin user',
        status: 403,
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Log the deletion
    console.log('about to log')
    const { ip, userAgent } = getClientInfo(request);
    await Logger.logUserDeletion(
      userId,
      performingUser.id,
      userToDelete,
      ip,
      userAgent,
      reason
    );
    
    console.log('logged')
    return returnSuccess({
      data: { 
        deletedUserId: userId,
        deletedUserEmail: userToDelete.email 
      },
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return returnError({
      message: 'Failed to delete user',
      error: error.message,
      status: 500,
    });
  }
}



export const PUT = withAuth(updateUserHandler, { roles: ['admin'] });
export const DELETE = withAuth(deleteUserHandler, { roles: ['admin'] });
