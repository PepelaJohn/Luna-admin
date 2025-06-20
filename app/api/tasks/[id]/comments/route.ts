// app/api/tasks/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/Task';
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { UNAUTHORIZED, NOT_FOUND, FORBIDDEN, BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@/constants/http';
import mongoose from 'mongoose';

// GET /api/tasks/[id]/comments - Get all comments for a task
const getTaskComments = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    
    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return returnError({
        message: "Invalid task ID",
        status: BAD_REQUEST
      });
    }

    const task = await Task.findById(id).select('comments assignedTo assignedBy').lean();
    if (!task) {
      return returnError({
        message: "Task not found",
        status: NOT_FOUND
      });
    }

    // Check if user can view this task
    const canViewTask = (userRole: string, task: any, userId: string): boolean => {
      if (userRole === 'super_admin') return true;
      if (task.assignedTo.userId.toString() === userId || task.assignedBy.userId.toString() === userId) return true;
      return false;
    };

    if (!canViewTask(user.role, task, user.id)) {
      return returnError({
        message: "Access Denied",
        status: FORBIDDEN
      });
    }

    // Get comments with pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Sort comments by creation date (newest first)
    const sortedComments = [...task.comments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = sortedComments.slice(startIndex, endIndex);

    const totalComments = task.comments.length;
    const totalPages = Math.ceil(totalComments / limit);

    return returnSuccess({
      message: 'Comments retrieved successfully',
      data: {
        comments: paginatedComments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      status: 200
    });

  } catch (error: any) {
    return returnError({
      message: error.message || "Could not retrieve comments",
      error,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

// POST /api/tasks/[id]/comments - Add comment to task (your existing implementation)
const addCommentsToTask = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    
    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return returnError({
        message: "Invalid task ID",
        status: BAD_REQUEST
      });
    }

    const { message } = await request.json();

    if (!message || message.trim().length === 0) {
      return returnError({
        message: 'Comment message is required',
        status: BAD_REQUEST
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return returnError({
        message: "Task not found",
        status: NOT_FOUND
      });
    }

    // Check if user can view/comment on this task
    const canViewTask = (userRole: string, task: any, userId: string): boolean => {
      if (userRole === 'super_admin') return true;
      if (task.assignedTo.userId.toString() === userId || task.assignedBy.userId.toString() === userId) return true;
      return false;
    };

    if (!canViewTask(user.role, task, user.id)) {
      return returnError({
        message: "Access Denied",
        status: FORBIDDEN
      });
    }

    // Add comment using the instance method
    await task.addComment(user.id, user.name, message.trim());

    // TODO: Create notification for the other party
    // const notifyUserId = task.assignedTo.userId.toString() === user.id 
    //   ? task.assignedBy.userId 
    //   : task.assignedTo.userId;
    
    // await createNotification({
    //   type: 'task_comment',
    //   to: notifyUserId,
    //   from: user.id,
    //   relatedTask: task._id,
    //   message: `New comment on task: ${task.title}`
    // });

    return returnSuccess({
      message: 'Comment added successfully',
      data: task.comments[task.comments.length - 1],
      status: 201
    });

  } catch (error: any) {
    return returnError({
      message: error.message || "Could not add comment to task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getTaskComments, { roles: ['admin', 'super_admin'] });
export const POST = withAuth(addCommentsToTask, { roles: ['admin', 'super_admin'] });