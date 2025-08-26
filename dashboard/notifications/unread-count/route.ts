// app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import { returnError, returnSuccess } from '@/lib/response';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@/constants/http';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongoose';
import { authenticate, AuthenticatedRequest } from '@/middleware/middleware';
// import { withAuth } from '@/middleware/middleware';

const withAuth = (
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) => {
  return async (request: NextRequest) => {
    const authResult = await authenticate(request);

    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error?.message || "Authentication failed" },
        { status: authResult.error?.status || UNAUTHORIZED }
      );
    }

    return handler(authResult.request!);
  };
};

// GET /api/notifications/unread-count - Get unread notification count for the current user
const getUnreadCount = async (request: NextRequest) => {
  try {
    await connectDB();
    
    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      'recipient.userId': new mongoose.Types.ObjectId(user.id),
      isRead: false,
      isArchived: false
    });

    // Also get recent notification types count for additional context
    const recentCounts = await Notification.aggregate([
      {
        $match: {
          'recipient.userId': new mongoose.Types.ObjectId(user.id),
          isRead: false,
          isArchived: false,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeCounts = recentCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return returnSuccess({
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount,
        typeCounts: {
          // Task-related notifications
          task_assigned: typeCounts.task_assigned || 0,
          task_completed: typeCounts.task_completed || 0,
          task_status_changed: typeCounts.task_status_changed || 0,
          task_comment: typeCounts.task_comment || 0,
          task_overdue: typeCounts.task_overdue || 0,
          task_due_soon: typeCounts.task_due_soon || 0,
          
          // User/Account-related notifications
          role_changed: typeCounts.role_changed || 0,
          login_alert: typeCounts.login_alert || 0,
          security_alert: typeCounts.security_alert || 0,
          account_update: typeCounts.account_update || 0,
          
          // System notifications
          system_announcement: typeCounts.system_announcement || 0,
          
          // Communication notifications
          new_message: typeCounts.new_message || 0
        },
        lastChecked: new Date().toISOString()
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return returnError({
      message: error.message || "Could not retrieve unread count",
      error: error.message,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getUnreadCount);