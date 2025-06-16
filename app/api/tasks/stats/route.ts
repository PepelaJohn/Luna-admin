// app/api/tasks/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/Task';
import { withAuth } from '@/lib/api-middleware';
import { returnError, returnSuccess } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@/constants/http';
import mongoose from 'mongoose';

// GET /api/tasks/stats - Get task statistics
const getTaskStats = async (request: NextRequest) => {
  try {
    await connectDB();

    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    // Build match query based on user role
    const matchQuery = user.role === 'super_admin' 
      ? {} 
      : {
          $or: [
            { 'assignedTo.userId': new mongoose.Types.ObjectId(user.id) },
            { 'assignedBy.userId': new mongoose.Types.ObjectId(user.id) }
          ]
        };

    // Get overall statistics
    const overallStats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    // Get tasks assigned to me vs assigned by me (for non-super admin)
    let assignmentStats = null;
    if (user.role !== 'super_admin') {
      assignmentStats = await Task.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            assignedToMe: {
              $sum: {
                $cond: [
                  { $eq: ['$assignedTo.userId', new mongoose.Types.ObjectId(user.id)] },
                  1,
                  0
                ]
              }
            },
            assignedByMe: {
              $sum: {
                $cond: [
                  { $eq: ['$assignedBy.userId', new mongoose.Types.ObjectId(user.id)] },
                  1,
                  0
                ]
              }
            },
            completedByMe: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$assignedTo.userId', new mongoose.Types.ObjectId(user.id)] },
                      { $eq: ['$status', 'completed'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            pendingOnMe: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$assignedTo.userId', new mongoose.Types.ObjectId(user.id)] },
                      { $in: ['$status', ['pending', 'in_progress']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
    }

    // Get statistics by category
    const categoryStats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get statistics by priority
    const priorityStats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { 
        $sort: { 
          _id: 1 // Sort by priority: low, medium, high, urgent
        } 
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Task.aggregate([
      { 
        $match: {
          ...matchQuery,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get upcoming due dates (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingTasks = await Task.find({
      ...matchQuery,
      dueDate: {
        $gte: new Date(),
        $lte: sevenDaysFromNow
      },
      status: { $in: ['pending', 'in_progress'] }
    })
    .select('title dueDate priority status assignedTo assignedBy')
    .sort({ dueDate: 1 })
    .limit(10);

    // Format response
    const stats = {
      overall: overallStats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        highPriority: 0,
        urgentPriority: 0
      },
      assignment: assignmentStats?.[0] || null,
      byCategory: categoryStats,
      byPriority: priorityStats,
      recentActivity,
      upcomingTasks
    };

    return returnSuccess({
      message: 'Task statistics retrieved successfully',
      data: {stats},
      status: 200
    });

  } catch (error: any) {

    console.log(error)
    return returnError({
      message: error.message || "Could not retrieve task statistics",
      error,
      status: error.status || INTERNAL_SERVER_ERROR
    });
  }
};

export const GET = withAuth(getTaskStats, { roles: ['admin', 'super_admin'] });