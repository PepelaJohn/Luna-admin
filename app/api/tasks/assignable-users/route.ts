// app/api/tasks/assignable-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User'; // Assuming you have a User model
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@/constants/http';

// GET /api/tasks/assignable-users - Get users that can be assigned tasks
const getAssignableUsers = async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build query based on user role and permissions
    let query: any = {
      _id: { $ne: user.id }, // Exclude current user
      role: { $in: ['admin', 'super_admin'] }, // Only admin users can be assigned tasks
      isActive: true // Only active users
    };

    // If current user is admin (not super_admin), they can only assign to other admins
    if (user.role === 'admin') {
      query.role = 'admin';
    }

    // Add search functionality
    if (search && search.trim().length > 0) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Get users with minimal information needed for task assignment
    const assignableUsers = await User.find(query)
      .select('name email role avatar createdAt')
      .sort({ name: 1 })
      .limit(50) // Limit results to prevent performance issues
      .lean();

    // Format response with additional helpful information
    const formattedUsers = assignableUsers.map(assignableUser => ({
      _id: assignableUser._id,
      name: assignableUser.name,
      email: assignableUser.email,
      role: assignableUser.role,
      avatar: assignableUser.avatar || null,
      canAssignTo: true, // All returned users can be assigned to
      joinedAt: assignableUser.createdAt
    }));

    return returnSuccess({
      message: 'Assignable users retrieved successfully',
      data: {
        users: formattedUsers,
        totalCount: formattedUsers.length,
        canAssignTo: user.role === 'super_admin' ? ['admin', 'super_admin'] : ['admin']
      },
      status: 200
    });

  } catch (error: any) {
    return returnError({
      message: error.message || "Could not retrieve assignable users",
      error,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getAssignableUsers, { roles: ['admin', 'super_admin'] });