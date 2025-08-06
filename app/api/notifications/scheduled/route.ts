// API Route for manual trigger (useful for testing or manual runs)
// app/api/notifications/scheduled/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notificationScheduler';
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@/constants/http';

const runScheduledNotifications = async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    // Only super admins can manually trigger scheduled notifications
    if (user.role !== 'super_admin') {
      return returnError({
        message: "Access denied",
        status: UNAUTHORIZED,
      });
    }

    const results = await NotificationScheduler.processAllScheduledNotifications();

    return returnSuccess({
      message: 'Scheduled notifications processed successfully',
      data: results,
      status: 200
    });

  } catch (error: any) {
    console.error('Error running scheduled notifications:', error);
    return returnError({
      message: error.message || "Could not process scheduled notifications",
      error: error.message,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const POST = withAuth(runScheduledNotifications, { roles: ['super_admin'] });
