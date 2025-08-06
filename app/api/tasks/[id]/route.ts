// app/api/tasks/[id]/route.ts - Updated with notification integration
import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
import { withAuth } from "@/lib/api-middleware";
import { returnError, returnSuccess } from "@/lib/response";
import { connectDB } from "@/lib/db";
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} from "@/constants/http";
import mongoose from "mongoose";
import NotificationService from "@/lib/notificationService";

// GET /api/tasks/[id] - Get a specific task
const getTask = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return returnError({
        message: "Invalid task ID",
        status: BAD_REQUEST,
      });
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return returnError({
        message: "Task not found",
        status: NOT_FOUND,
      });
    }

    // Check if user can access this task
    if (
      user.role !== "super_admin" &&
      task.assignedTo.userId.toString() !== user.id &&
      task.assignedBy.userId.toString() !== user.id
    ) {
      return returnError({
        message: "Access denied",
        status: FORBIDDEN,
      });
    }

    return returnSuccess({
      message: "Task retrieved successfully",
      data: task,
      status: 200,
    });
  } catch (error: any) {
    return returnError({
      message: error.message || "Could not retrieve task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

// PUT /api/tasks/[id] - Update a specific task with notification support
const updateTask = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return returnError({
        message: "Invalid task ID",
        status: BAD_REQUEST,
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return returnError({
        message: "Task not found",
        status: NOT_FOUND,
      });
    }

    // Check if user can update this task
    if (!task.canUserAccess(user.id, user.role)) {
      return returnError({
        message: "Access denied",
        status: FORBIDDEN,
      });
    }

    const body = await request.json();
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      category,
      attachments,
    } = body;

    // Store original status for notification comparison
    const originalStatus = task.status;

    // Update allowed fields
    const updateFields: any = {};

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return returnError({
          message: "Task title cannot be empty",
          status: BAD_REQUEST,
        });
      }
      updateFields.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || description.trim().length === 0) {
        return returnError({
          message: "Task description cannot be empty",
          status: BAD_REQUEST,
        });
      }
      updateFields.description = description.trim();
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high", "urgent"].includes(priority)) {
        return returnError({
          message: "Invalid priority value",
          status: BAD_REQUEST,
        });
      }
      updateFields.priority = priority;
    }

    if (status !== undefined) {
      if (
        !["pending", "in_progress", "completed", "cancelled"].includes(status)
      ) {
        return returnError({
          message: "Invalid status value",
          status: BAD_REQUEST,
        });
      }

      // Use the instance method to update status
      if (status !== task.status) {
        await task.updateStatus(
          status,
          status === "completed" ? new Date() : undefined
        );
      }
    }

    if (dueDate !== undefined) {
      if (dueDate && new Date(dueDate) <= new Date()) {
        return returnError({
          message: "Due date must be in the future",
          status: BAD_REQUEST,
        });
      }
      updateFields.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (category !== undefined) {
      const validCategories = [
        "user_management",
        "system_config",
        "content_review",
        "security_audit",
        "data_analysis",
        "maintenance",
        "support",
        "other",
      ];
      if (!validCategories.includes(category)) {
        return returnError({
          message: "Invalid category value",
          status: BAD_REQUEST,
        });
      }
      updateFields.category = category;
    }

    if (attachments !== undefined) {
      updateFields.attachments = Array.isArray(attachments)
        ? attachments.filter((att: string) => att && att.trim().length > 0)
        : [];
    }

    // Apply updates
    Object.assign(task, updateFields);
    await task.save();

    // Create notification if status changed
    if (status && status !== originalStatus) {
      try {
        await NotificationService.createTaskStatusChangedNotification(
          {
            taskId: (task._id as any).toString(),
            title: task.title,
            assignedBy: {
              userId: task.assignedBy.userId.toString(),
              name: task.assignedBy.name,
              email: task.assignedBy.email,
            },
            assignedTo: {
              userId: task.assignedTo.userId.toString(),
              name: task.assignedTo.name,
              email: task.assignedTo.email,
            },
          },
          {
            userId: user.id,
            name: user.name,
            email: user.email,
          },
          originalStatus,
          status
        );
      } catch (notificationError) {
        console.error(
          "Failed to create status change notification:",
          notificationError
        );
        // Don't fail the update if notification fails
      }
    }

    return returnSuccess({
      message: "Task updated successfully",
      data: task,
      status: 200,
    });
  } catch (error: any) {
    return returnError({
      message: error.message || "Could not update task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

// DELETE /api/tasks/[id] - Delete/Cancel a specific task
const deleteTask = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const user = (request as any).user;
    if (!user) {
      return returnError({
        message: "Not authorized",
        status: UNAUTHORIZED,
      });
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return returnError({
        message: "Invalid task ID",
        status: BAD_REQUEST,
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return returnError({
        message: "Task not found",
        status: NOT_FOUND,
      });
    }

    // Only the task creator or super admin can delete tasks
    if (
      user.role !== "super_admin" &&
      task.assignedBy.userId.toString() !== user.id
    ) {
      return returnError({
        message: "Only the task creator or super admin can delete tasks",
        status: FORBIDDEN,
      });
    }

    // Check if task can be deleted (not completed)
    if (task.status === "completed") {
      return returnError({
        message: "Cannot delete completed tasks",
        status: BAD_REQUEST,
      });
    }

    const originalStatus = task.status;

    // Instead of deleting, mark as cancelled (soft delete)
    await task.updateStatus("cancelled");

    // Create notification for cancellation
    try {
      await NotificationService.createTaskStatusChangedNotification(
        {
          taskId: (task._id as any).toString(),
          title: task.title,
          assignedBy: {
            userId: task.assignedBy.userId.toString(),
            name: task.assignedBy.name,
            email: task.assignedBy.email,
          },
          assignedTo: {
            userId: task.assignedTo.userId.toString(),
            name: task.assignedTo.name,
            email: task.assignedTo.email,
          },
        },
        {
          userId: user.id,
          name: user.name,
          email: user.email,
        },
        originalStatus,
        "cancelled"
      );
    } catch (notificationError) {
      console.error(
        "Failed to create cancellation notification:",
        notificationError
      );
    }

    return returnSuccess({
      message: "Task cancelled successfully",
      data: task,
      status: 200,
    });
  } catch (error: any) {
    return returnError({
      message: error.message || "Could not delete task",
      error,
      status: error.status || INTERNAL_SERVER_ERROR,
    });
  }
};

export const GET = withAuth(getTask, { roles: ["admin", "super_admin"] });
export const PUT = withAuth(updateTask, { roles: ["admin", "super_admin"] });
export const DELETE = withAuth(deleteTask, { roles: ["admin", "super_admin"] });
