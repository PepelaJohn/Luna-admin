
// @/app/api/users/[id]/route.ts - Example Usage in User Management
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import User from '@/models/User';
import { Logger } from '@/lib/logger';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  isActive: z.boolean().optional(),
  reason: z.string().optional(), // Reason for the change
});

async function updateUserHandler(request: NextRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { id } = context.params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    const { reason, ...updateData } = validatedData;
    
    // Get current user data for logging
    const currentUser = await User.findById(id).lean();
    if (!currentUser) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    // Log the update
    const performedBy = (request as any).user.id; // From auth middleware
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await Logger.logUserUpdate(
      id,
      performedBy,
      currentUser,
      updatedUser,
      ip,
      userAgent,
      reason
    );

    return returnSuccess({
      data: { user: updatedUser },
      message: 'User updated successfully',
    });
  } catch (error: any) {
    // Log failed attempt
    try {
      const performedBy = (request as any).user?.id;
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      
      if (performedBy) {
        await Logger.log({
          action: 'update',
          entity: 'User',
          entityId: context.params.id,
          performedBy,
          metadata: { reason: 'Update failed', error: error.message },
          ip,
          status: 'failed',
          severity: 'medium'
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Failed to update user',
      error: error.message,
      status: 500,
    });
  }
}

async function deleteUserHandler(request: NextRequest, context: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { id } = context.params;
    const body = await request.json();
    const { reason } = body;
    
    // Get user data before deletion for logging
    const userToDelete = await User.findById(id).lean();
    if (!userToDelete) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    // Log the deletion
    const performedBy = (request as any).user.id;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await Logger.logUserDeletion(
      id,
      performedBy,
      userToDelete,
      ip,
      userAgent,
      reason
    );

    return returnSuccess({
      data: { deletedId: id },
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

export const PATCH = withAuth(updateUserHandler, { roles: ['admin', 'super_admin'] });
export const DELETE = withAuth(deleteUserHandler, { roles: ['super_admin'] }); // Only super_admin can delete users