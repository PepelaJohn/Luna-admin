// app/api/tasks/assigned-to-me/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';

// GET /api/tasks/assigned-to-me - Get tasks assigned to current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const filter: any = {
      'assignedTo.userId': user.id
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const result = await (Task as any).findWithPagination(
      filter,
      page,
      limit,
      { createdAt: -1 }
    );

    return NextResponse.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}