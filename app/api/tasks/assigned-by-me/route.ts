// app/api/tasks/assigned-by-me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/Task';
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST } from '@/constants/http';
import mongoose from 'mongoose';

// GET /api/tasks/assigned-by-me - Get tasks assigned by the current user
const getAssignedByMeTasks = async (request: NextRequest) => {
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');
    const assignee = searchParams.get('assignee'); // Filter by assignee

    // Build query filters
    const filters: any = {
      'assignedBy.userId': new mongoose.Types.ObjectId(user._id)
    };

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (priority && priority !== 'all') {
      filters.priority = priority;
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (assignee && assignee !== 'all') {
      filters['assignedTo.userId'] = new mongoose.Types.ObjectId(assignee);
    }

    if (search && search.trim().length > 0) {
      filters.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'assignedTo.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filters)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filters)
    ]);
    console.log(tasks)

    // Calculate pagination info
    const totalPages = Math.ceil(totalTasks / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get task counts by status for filter stats
    const taskCounts = await Task.aggregate([
      {
        $match: {
          'assignedBy.userId': new mongoose.Types.ObjectId(user._id)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = taskCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Get unique assignees for filter dropdown
    const assignees = await Task.aggregate([
      {
        $match: {
          'assignedBy.userId': new mongoose.Types.ObjectId(user._id)
        }
      },
      {
        $group: {
          _id: '$assignedTo.userId',
          name: { $first: '$assignedTo.name' },
          email: { $first: '$assignedTo.email' },
          taskCount: { $sum: 1 }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    return returnSuccess({
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNextPage,
          hasPrevPage,
          limit
        },
        filters: {
          status,
          priority,
          category,
          search,
          assignee
        },
        statusCounts: {
          all: totalTasks,
          pending: statusCounts.pending || 0,
          in_progress: statusCounts.in_progress || 0,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0
        },
        assignees: assignees.map(a => ({
          userId: a._id,
          name: a.name,
          email: a.email,
          taskCount: a.taskCount
        }))
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Error fetching assigned by me tasks:', error);
    return returnError({
      message: error.message || "Could not retrieve tasks assigned by you",
      error: error.message,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getAssignedByMeTasks, { roles: ['admin', 'super_admin'] });