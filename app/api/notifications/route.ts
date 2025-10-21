// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST } from '@/constants/http';
import mongoose from 'mongoose';

// GET /api/notifications - Get notifications for the current user
const getNotifications = async (request: NextRequest) => {
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per request
    const includeRead = searchParams.get('includeRead') === 'true';
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const type = searchParams.get('type') as any;

    // Build query filters
    const filters: any = {
      'recipient.userId': new mongoose.Types.ObjectId(user._id)
    };

    if (!includeRead) {
      filters.isRead = false;
    }

    if (!includeArchived) {
      filters.isArchived = false;
    }

    if (type && ['task_assigned', 'task_completed', 'task_status_changed', 'task_comment', 'task_overdue', 'task_due_soon'].includes(type)) {
      filters.type = type;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get notifications with pagination
    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filters),
      Notification.countDocuments({
        'recipient.userId': new mongoose.Types.ObjectId(user._id),
        isRead: false,
        isArchived: false
      })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalNotifications / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return returnSuccess({
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalNotifications,
          hasNextPage,
          hasPrevPage,
          limit
        },
        unreadCount,
        filters: {
          includeRead,
          includeArchived,
          type
        }
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return returnError({
      message: error.message || "Could not retrieve notifications",
      error: error.message,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

// PUT /api/notifications - Mark notifications as read/unread or archive
const updateNotifications = async (request: NextRequest) => {
  try {
    await connectDB();
    
    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (!action || !['mark_read', 'mark_unread', 'archive', 'unarchive'].includes(action)) {
      return returnError({
        message: "Invalid action. Must be 'mark_read', 'mark_unread', 'archive', or 'unarchive'",
        status: BAD_REQUEST
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return returnError({
        message: "notificationIds array is required",
        status: BAD_REQUEST
      });
    }

    // Validate ObjectIds
    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return returnError({
        message: "No valid notification IDs provided",
        status: BAD_REQUEST
      });
    }

    // Build update object based on action
    let updateQuery: any = {};
    
    switch (action) {
      case 'mark_read':
        updateQuery = {
          isRead: true,
          readAt: new Date()
        };
        break;
      case 'mark_unread':
        updateQuery = {
          isRead: false,
          $unset: { readAt: 1 }
        };
        break;
      case 'archive':
        updateQuery = {
          isArchived: true,
          archivedAt: new Date()
        };
        break;
      case 'unarchive':
        updateQuery = {
          isArchived: false,
          $unset: { archivedAt: 1 }
        };
        break;
    }

    // Update notifications (only user's own notifications)
    const result = await Notification.updateMany(
      {
        _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
        'recipient.userId': new mongoose.Types.ObjectId(user._id)
      },
      updateQuery
    );

    return returnSuccess({
      message: `${result.modifiedCount} notifications updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        action,
        processedIds: validIds
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return returnError({
      message: error.message || "Could not update notifications",
      error: error.message,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getNotifications, { roles: ['admin', 'super_admin'] });
export const PUT = withAuth(updateNotifications, { roles: ['admin', 'super_admin'] });