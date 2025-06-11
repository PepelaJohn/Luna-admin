// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
import { withAuth } from "@/lib/api-middleware";
import { returnError, returnSuccess } from "@/lib/response";
import { connectDB } from "@/lib/db";
import {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "@/constants/http";
import mongoose from "mongoose";

// GET /api/tasks - Get all tasks for the user

const getTasks = async (request: NextRequest) => {
 
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const assignedToMe = searchParams.get("assignedToMe") === "true";
    const assignedByMe = searchParams.get("assignedByMe") === "true";
    const search = searchParams.get("search");

    // Build filter object
    const filters: any = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    // Search in title and description
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build query based on user role and filters
    let query: any;

    if (user.role === "super_admin") {
      // Super admin can see all tasks
      query = filters;
    } else {
      // Regular admin can only see tasks they're involved in
      const userConditions = [];

      if (assignedToMe && assignedByMe) {
        // Both assigned to me and by me
        userConditions.push(
          { "assignedTo.userId": new mongoose.Types.ObjectId(user.id) },
          { "assignedBy.userId": new mongoose.Types.ObjectId(user.id) }
        );
      } else if (assignedToMe) {
        // Only assigned to me
        userConditions.push({
          "assignedTo.userId": new mongoose.Types.ObjectId(user.id),
        });
      } else if (assignedByMe) {
        // Only assigned by me
        userConditions.push({
          "assignedBy.userId": new mongoose.Types.ObjectId(user.id),
        });
      } else {
        // Default: tasks assigned to me or by me
        userConditions.push(
          { "assignedTo.userId": new mongoose.Types.ObjectId(user.id) },
          { "assignedBy.userId": new mongoose.Types.ObjectId(user.id) }
        );
      }

      query = {
        ...filters,
        $or: userConditions,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    return returnSuccess({
      message: "Tasks retrieved successfully",
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      status: 200,
    });
  } catch (error: any) {
    return returnError({
      message: error.message || "Could not retrieve tasks",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

// POST /api/tasks - Create a new task
const createTask = async (request: NextRequest) => {
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
    const {
      title,
      description,
      assignedToUserId,
      assignedToName,
      assignedToEmail,
      assignedToRole,
      priority = "medium",
      dueDate,
      category,
      attachments = [],
    } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return returnError({
        message: "Task title is required",
        status: BAD_REQUEST,
      });
    }

    if (!description || description.trim().length === 0) {
      return returnError({
        message: "Task description is required",
        status: BAD_REQUEST,
      });
    }

    if (
      !assignedToUserId ||
      !assignedToName ||
      !assignedToEmail ||
      !assignedToRole
    ) {
      return returnError({
        message: "Assigned user information is required",
        status: BAD_REQUEST,
      });
    }

    if (!category) {
      return returnError({
        message: "Task category is required",
        status: BAD_REQUEST,
      });
    }

    // Check if user can assign tasks to the specified role
    const canAssignTask = (
      assignerRole: string,
      assigneeRole: string
    ): boolean => {
      if (assignerRole === "super_admin") return true;
      if (assignerRole === "admin" && assigneeRole === "admin") return true;
      return false;
    };

    if (!canAssignTask(user.role, assignedToRole)) {
      return returnError({
        message: "You do not have permission to assign tasks to this user role",
        status: FORBIDDEN,
      });
    }

    // Prevent self-assignment
    if (assignedToUserId === user.id) {
      return returnError({
        message: "Cannot assign task to yourself",
        status: BAD_REQUEST,
      });
    }

    // Create task
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      assignedBy: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      assignedTo: {
        userId: assignedToUserId,
        name: assignedToName,
        email: assignedToEmail,
        role: assignedToRole,
      },
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      category,
      attachments: attachments.filter((att: string) => att.trim().length > 0),
    });

    await task.save();

    // TODO: Create notification for assigned user
    // await createNotification({
    //   type: 'task_assigned',
    //   to: assignedToUserId,
    //   from: user.id,
    //   relatedTask: task._id,
    //   message: `New task assigned: ${task.title}`,
    //   actionRequired: true
    // });

    return returnSuccess({
      message: "Task created successfully",
      data: task,
      status: 201,
    });
  } catch (error: any) {
    return returnError({
      message: error.message || "Could not create task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

export const GET = withAuth(getTasks, { roles: ["admin", "super_admin"] });
export const POST = withAuth(createTask, { roles: ["admin", "super_admin"] });
