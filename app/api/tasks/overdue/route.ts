// app/api/tasks/overdue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/tasks/overdue - Get overdue tasks for current user
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

    const filter = {
      $or: [
        { 'assignedTo.userId': user.id },
        ...(user.role === 'super_admin' ? [{}] : [{ 'assignedBy.userId': user.id }])
      ],
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    };

    const result = await (Task as any).findWithPagination(
      filter,
      page,
      limit,
      { dueDate: 1 } // Sort by due date ascending (most overdue first)
    );

    return NextResponse.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}