// @/app/api/admin/users/route.ts - Complete User Management with Logging
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import { Logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { User as UserType } from '@/lib/types';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { timeFromNow } from '@/utils/date';
import { sendConfirmationStartupEmail } from '@/lib/email';

// Validation schemas
const getUsersSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100).default('10'),
  search: z.string().optional(),
  role: z.enum(['normal', 'admin', 'super_admin', 'corporate', 'moderator', 'all']).default('all'),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isActive: z.enum(['true', 'false', 'all']).default('all'),
  isEmailVerified: z.enum(['true', 'false', 'all']).default('all'),
});

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['normal', 'admin', 'super_admin', 'corporate', 'moderator']).default('normal'),
  isActive: z.boolean().default(true),
  phone: z.string().optional(),
  reason: z.string().optional(), // Reason for creating the user
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['normal', 'admin', 'super_admin']).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  reason: z.string().optional(), // Reason for the update
});

const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete']),
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
  reason: z.string().optional(),
});

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             
             'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  return { ip, userAgent };
}

// GET - Fetch users with filtering and pagination
async function getUsersHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedParams = getUsersSchema.parse(queryParams);
    
    const {
      page,
      limit,
      search,
      role,
      sortBy,
      sortOrder,
      isActive,
      isEmailVerified
    } = validatedParams;

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role !== 'all') {
      filter.role = role;
    }

    // Active status filter
    if (isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }

    // Email verification filter
    if (isEmailVerified !== 'all') {
      filter.isEmailVerified = isEmailVerified === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination (with filters applied)
    const total = await User.countDocuments(filter);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);

    // Get users with pagination and filters
    const users = await User.find(filter)
      .select('-password') // Exclude password field
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean(); // Use lean() for better performance

    

    return returnSuccess({
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        filters: {
          search,
          role,
          isActive,
          isEmailVerified,
          sortBy,
          sortOrder
        }
      },
      message: 'Users retrieved successfully'
    });
  } catch (error: any) {
   
    
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid query parameters',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Failed to fetch users',
      error: error.message,
      status: 500,
    });
  }
}



// POST - Create new user
async function createUserHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log(body)
    const validatedData = createUserSchema.parse(body);
    const { reason, password, ...userData } = validatedData;
    console.log(validatedData)
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return returnError({
        message: 'User with this email already exists',
        status: 409,
      });
    }



    
    // Create user
    const newUser = new User({
      ...userData,
      password,
    });

    

    const verificationCode = await VerificationCode.create({
    userId:newUser._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: timeFromNow("d", 1),
  });

  await sendConfirmationStartupEmail({
    name:newUser.name,
    email: newUser.email,
    token: verificationCode._id.toString(),
  });

    // Log the creation
    const performedBy = (request as any).user?.id || (request as any).user?._id;
    const { ip, userAgent } = getClientInfo(request);

    
    await Logger.logUserCreation(
      newUser._id.toString(),
      performedBy,
      { ...userData, createdBy: performedBy,  },
      ip,
      userAgent
    );

 
     await newUser.save();
    return returnSuccess({
      
      message: 'User created successfully',
      status: 201,
    });
  } catch (error: any) {
    // Log failed creation attempt
    console.log(error)
    try {
      console.log(error)
      console.log((request as any).user?.id,(request as any).user?._id )
      const performedBy = (request as any).user?.id || (request as any).user?._id;
      const { ip } = getClientInfo(request);
      
      if (performedBy) {
        await Logger.log({
          action: 'create',
          entity: 'User',
          entityId: performedBy, // Using admin's ID since user creation failed
          performedBy,
          metadata: { 
            reason: 'User creation failed', 
            error: error.message,
            
          },
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

    if (error.code === 11000) {
      return returnError({
        message: 'User with this email already exists',
        status: 409,
      });
    }

    return returnError({
      message: error.message || 'Failed to create user',
      error: error.message,
      status: 500,
    });
  }
}

// PATCH - Bulk actions (activate/deactivate/delete multiple users)
async function bulkActionHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action, userIds, reason } = bulkActionSchema.parse(body);

    const performedBy = (request as any).user.id;
    const { ip, userAgent } = getClientInfo(request);

    // Get users before action for logging
    const usersBeforeAction:UserType[] = await User.find({ _id: { $in: userIds } }).lean() as any;
    
    if (usersBeforeAction.length === 0) {
      return returnError({
        message: 'No users found with provided IDs',
        status: 404,
      });
    }

    let result;
    let successCount = 0;
    const errors: any[] = [];

    for (const user of usersBeforeAction) {
      try {
        switch (action) {
          case 'activate':
            await User.findByIdAndUpdate(user._id, { isActive: true });
            await Logger.log({
              action: 'update',
              entity: 'User',
              entityId: user._id,
              performedBy,
              metadata: {
                old: { isActive: user.isActive },
                new: { isActive: true },
                changes: ['isActive'],
                reason: reason || 'Bulk activation'
              },
              ip,
              userAgent,
              severity: 'medium'
            });
            break;

          case 'deactivate':
            await User.findByIdAndUpdate(user._id, { isActive: false });
            await Logger.log({
              action: 'update',
              entity: 'User',
              entityId: user._id,
              performedBy,
              metadata: {
                old: { isActive: user.isActive },
                new: { isActive: false },
                changes: ['isActive'],
                reason: reason || 'Bulk deactivation'
              },
              ip,
              userAgent,
              severity: 'high'
            });
            break;

          case 'delete':
            await User.findByIdAndDelete(user._id);
            await Logger.logUserDeletion(
              user._id.toString(),
              performedBy,
              user,
              ip,
              userAgent,
              reason || 'Bulk deletion'
            );
            break;
        }
        successCount++;
      } catch (error:any) {
        errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
      }
    }

    return returnSuccess({
      data: {
        action,
        totalRequested: userIds.length,
        successful: successCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Bulk ${action} completed. ${successCount} successful, ${errors.length} failed.`,
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
      message: `Failed to perform bulk action`,
      error: error.message,
      status: 500,
    });
  }
}

// PUT - Update user
async function updateUserHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {  ...updateData } = body;
    // const reason = "User Requested deletion"
    
    const userId = request.url.split('/').pop()
   
    if (!userId) {
      return returnError({
        message: 'User ID is required',
        status: 400,
      });
    }

    const validatedData = updateUserSchema.parse(updateData);
    const { reason="User Requested deletion", password, ...userData } = validatedData;

    // Get current user data for logging
    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    // Prepare update data
    const updatePayload: any = { ...userData };
    
    // Hash password if provided
    if (password) {
      updatePayload.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-password').lean();

    // Log the update
    const performedBy = (request as any).user.id;
    const { ip, userAgent } = getClientInfo(request);

    await Logger.logUserUpdate(
      userId,
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
      const { ip } = getClientInfo(request);
      
      if (performedBy) {
        await Logger.log({
          action: 'update',
          entity: 'User',
          entityId:  'unknown',
          performedBy,
          metadata: { 
            reason: 'Update failed', 
            error: error.message,
            
          },
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

// DELETE - Delete single user
async function deleteUserHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, reason } = body;
    
    if (!userId) {
      return returnError({
        message: 'User ID is required',
        status: 400,
      });
    }
    
    // Get user data before deletion for logging
    const userToDelete:UserType = await User.findById(userId).lean() as any;
    if (!userToDelete) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

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
    const { ip, userAgent } = getClientInfo(request);
    await Logger.logUserDeletion(
      userId,
      performingUser.id,
      userToDelete,
      ip,
      userAgent,
      reason
    );

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

// Export handlers with appropriate role restrictions
export const GET = withAuth(getUsersHandler, { roles: ['admin', 'super_admin'] });
export const POST = withAuth(createUserHandler, { roles: ['admin', 'super_admin'] });
export const PUT = withAuth(updateUserHandler, { roles: ['admin', 'super_admin'] });
export const DELETE = withAuth(deleteUserHandler, { roles: ['super_admin'] }); // Only super_admin can delete
export const PATCH = withAuth(bulkActionHandler, { roles: ['super_admin'] }); // Only super_admin can perform bulk actions