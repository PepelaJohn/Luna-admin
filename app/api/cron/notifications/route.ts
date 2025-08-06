
// Vercel Cron Job setup for Vercel deployment
// Create: app/api/cron/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NotificationScheduler } from '@/lib/notificationScheduler';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await NotificationScheduler.processAllScheduledNotifications();
    
    return NextResponse.json({
      message: 'Scheduled notifications processed',
      data: results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' }, 
      { status: 500 }
    );
  }
}
