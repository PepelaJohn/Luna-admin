

// @/app/api/logs/route.ts - Improved Logs API
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import Log from '@/models/Log';
import mongoose from 'mongoose';
import User from '@/models/User';
import Subscriber from '@/models/Subscriber';
import Partner from '@/models/Partner';

const entityModels: Record<string, mongoose.Model<any>> = {
  User,
  Subscriber,
  Partner,
};

// Validation schema for query parameters
const getLogsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
  action: z.string().optional(),
  entity: z.string().optional(),
  performedBy: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

async function getLogsHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedParams = getLogsSchema.parse(queryParams);
    
    const {
      page,
      limit,
      action,
      entity,
      performedBy,
      severity,
      dateFrom,
      dateTo
    } = validatedParams;

    // Build filter query
    const filter: any = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (performedBy) filter.performedBy = new mongoose.Types.ObjectId(performedBy);
    if (severity) filter.severity = severity;
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Log.countDocuments(filter);
    
    // Get logs with populated data
    const logs = await Log.find(filter)
      .populate("performedBy", "name email role _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate entity details
    const populatedLogs = await Promise.all(
      logs.map(async (log) => {
        const Model = entityModels[log.entity];
        if (!Model) return log;

        try {
          const entityDoc = await Model.findById(log.entityId).lean();
          return {
            ...log,
            entityDetails: entityDoc,
          };
        } catch (error) {
          // Entity might have been deleted
          return {
            ...log,
            entityDetails: null,
          };
        }
      })
    );

    return returnSuccess({
      data: {
        logs: populatedLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      message: 'Logs retrieved successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid query parameters',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Failed to retrieve logs',
      error: error.message,
      status: 500,
    });
  }
}

const deleteLogSchema = z.object({
  id: z.string().min(1, 'Log ID is required'),
});

async function deleteLogsHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id } = deleteLogSchema.parse(body);
    
    const deleted = await Log.findByIdAndDelete(id);
    
    if (!deleted) {
      return returnError({
        message: 'Log not found',
        status: 404,
      });
    }

    return returnSuccess({
      data: {
        deleted: deleted._id
      },
      status: 200,
      message: 'Log deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Failed to delete log',
      error: error.message,
      status: 500,
    });
  }
}

export const GET = withAuth(getLogsHandler, { roles: ["admin", "super_admin"] });
export const DELETE = withAuth(deleteLogsHandler, { roles: ['admin', 'super_admin'] });
