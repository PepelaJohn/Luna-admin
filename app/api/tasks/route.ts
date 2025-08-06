// app/api/tasks/route.ts - Updated with HTML content handling
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
import { NOtifyAdminuser, notifyMultipleUsers, stripHtmlTags } from "@/lib/email";
import NotificationService from "@/lib/notificationService";

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

    // Search in title and description (search in plain text for better results)
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

    console.log(query);
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
      },
      status: 200,
    });
  } catch (error: any) {
    console.log(error);
    return returnError({
      message: error.message || "Could not retrieve tasks",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

// POST /api/tasks - Create a new task with HTML content support
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
      priority = "medium",
      dueDate,
      assignedTo,
      assignedToUserId, // For backward compatibility
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

    // Validate description length (check plain text length for HTML content)
    const plainTextDescription = stripHtmlTags(description);
    if (plainTextDescription.length > 5000) {
      return returnError({
        message: "Task description is too long (max 5000 characters)",
        status: BAD_REQUEST,
      });
    }

    if (plainTextDescription.trim().length === 0) {
      return returnError({
        message: "Task description cannot be empty",
        status: BAD_REQUEST,
      });
    }

    if (!assignedTo && !assignedToUserId) {
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

    // Handle both old and new assignment formats
    let assignedUser;
    if (assignedTo) {
      assignedUser = assignedTo;
    } else if (assignedToUserId) {
      // For backward compatibility - would need to fetch user data
      return returnError({
        message: "Please provide complete assignedTo user object",
        status: BAD_REQUEST,
      });
    }

    const {
      _id: assignedToUserId_,
      name: assignedToName,
      email: assignedToEmail,
      role: assignedToRole,
    } = assignedUser;

    if (
      !assignedToUserId_ ||
      !assignedToName ||
      !assignedToEmail ||
      !assignedToRole
    ) {
      return returnError({
        message: "Complete assigned user information is required",
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
    if (assignedToUserId_ === user.id) {
      return returnError({
        message: "Cannot assign task to yourself",
        status: BAD_REQUEST,
      });
    }

    // Create task - store HTML content as-is
    const task = new Task({
      title: title.trim(),
      description: description.trim(), // Keep HTML content
      assignedBy: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      assignedTo: {
        userId: assignedToUserId_,
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

    // Create notification for task assignment
    try {
      await NotificationService.createTaskAssignedNotification({
        taskId: (task._id as any).toString(),
        title: task.title,
        assignedBy: {
          userId: user.id,
          name: user.name,
          email: user.email
        },
        assignedTo: {
          userId: assignedToUserId_,
          name: assignedToName,
          email: assignedToEmail
        }
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail task creation if notification fails
    }

    // Send email notification - the email function will handle HTML content processing
    try {
      await NOtifyAdminuser({
        description: description, // Pass original HTML content - email function will process it
        email: assignedToEmail,
        name: user.name,
        title,
        username: assignedToName
      });
      
      console.log(`Task notification email sent to ${assignedToEmail}`);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the task creation if email fails
    }

    return returnSuccess({
      message: "Task created successfully",
      data: { task },
      status: 201,
    });
  } catch (error: any) {
    console.log('Task creation error:', error.message);
    return returnError({
      message: error.message || "Could not create task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

// Additional endpoint for creating multiple tasks with HTML content support
const createMultipleTasks = async (request: NextRequest) => {
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
      priority = "medium",
      dueDate,
      category,
      attachments = [],
      assignedToUsers = []
    } = body;

    // Validation (same as single task)
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

    // Validate description length
    const plainTextDescription = stripHtmlTags(description);
    if (plainTextDescription.length > 5000) {
      return returnError({
        message: "Task description is too long (max 5000 characters)",
        status: BAD_REQUEST,
      });
    }

    if (!assignedToUsers || assignedToUsers.length === 0) {
      return returnError({
        message: "At least one user must be assigned",
        status: BAD_REQUEST,
      });
    }

    if (!category) {
      return returnError({
        message: "Task category is required",
        status: BAD_REQUEST,
      });
    }

    const createdTasks = [];
    const emailNotifications = [];
    let successful = 0;
    let failed = 0;

    // Create tasks for each assigned user
    for (const assignedUser of assignedToUsers) {
      try {
        const task = new Task({
          title: title.trim(),
          description: description.trim(), // Keep HTML content
          assignedBy: {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          assignedTo: {
            userId: assignedUser._id,
            name: assignedUser.name,
            email: assignedUser.email,
            role: assignedUser.role,
          },
          priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          category,
          attachments: attachments.filter((att: string) => att.trim().length > 0),
        });

        await task.save();
        createdTasks.push(task);

        // Create notification for task assignment
        try {
          await NotificationService.createTaskAssignedNotification({
            taskId: (task._id as any).toString(),
            title: task.title,
            assignedBy: {
              userId: user.id,
              name: user.name,
              email: user.email
            },
            assignedTo: {
              userId: assignedUser._id,
              name: assignedUser.name,
              email: assignedUser.email
            }
          });
        } catch (notificationError) {
          console.error(`Failed to create notification for ${assignedUser.name}:`, notificationError);
        }

        // Prepare email notification
        emailNotifications.push({
          email: assignedUser.email,
          username: assignedUser.name,
          title,
          description, // HTML content will be processed by email function
          sender: user.name
        });

        successful++;
      } catch (error) {
        console.error(`Failed to create task for ${assignedUser.name}:`, error);
        failed++;
      }
    }

    // Send email notifications
    if (emailNotifications.length > 0) {
      try {
        const emailResults = await notifyMultipleUsers(emailNotifications);
        console.log(`Email notifications: ${emailResults.successful} successful, ${emailResults.failed} failed`);
      } catch (emailError) {
        console.error("Failed to send email notifications:", emailError);
      }
    }

    return returnSuccess({
      message: `Tasks created successfully. ${successful} successful, ${failed} failed.`,
      data: { 
        tasks: createdTasks,
        successful,
        failed,
        total: assignedToUsers.length
      },
      status: 201,
    });

  } catch (error: any) {
    console.log('Multiple task creation error:', error.message);
    return returnError({
      message: error.message || "Could not create tasks",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

export const GET = withAuth(getTasks, { roles: ["admin", "super_admin"] });
export const POST = withAuth(createTask, { roles: ["admin", "super_admin"] });