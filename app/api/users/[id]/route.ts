// @/app/api/admin/users/[id]/route.ts (Update/Delete user - Admin only)
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { z } from "zod";
import User, { IUser } from "@/models/User";
import { returnSuccess, returnError } from "@/lib/response";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/api-middleware";
import { User as UserType } from "@/lib/types";
import { Logger } from "@/lib/logger";
import NotificationService from "@/lib/notificationService";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z
    .enum(["normal", "admin", "super_admin", "corporate", "moderator"])
    .optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  reason: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
});

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;
  return { ip, userAgent };
}

async function updateUserHandler(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const { ...updateData } = body;

    const userId = request.url.split("/").pop();

    if (!userId) {
      return returnError({
        message: "User ID is required",
        status: 400,
      });
    }

    const validatedData = updateUserSchema.parse(updateData);
    const {
      reason = "Admin requested update",
      password,
      ...userData
    } = validatedData;

    let updatedRole = false;
   
    // Get current user data for validation and logging
    const currentUser = (await User.findById(
      userId
    ).lean()) as unknown as IUser;
    if (!currentUser) {
      return returnError({
        message: "User not found",
        status: 404,
      });
    }
    
    const oldRole = currentUser.role
    

    const performingUser = (request as any).user as IUser;

    // Security checks
    // 1. Prevent self-modification
    if (userId === performingUser._id) {
      return returnError({
        message: "You cannot modify your own account",
        status: 403,
      });
    }

    // 2. Only super_admin can modify super_admin accounts
    if (
      currentUser.role === "super_admin" &&
      performingUser.role !== "super_admin"
    ) {
      return returnError({
        message: "Only super admins can modify super admin accounts",
        status: 403,
      });
    }

    // 3. Only super_admin can assign super_admin role
    if (
      userData.role === "super_admin" &&
      performingUser.role !== "super_admin"
    ) {
      return returnError({
        message: "Only super admins can assign super admin role",
        status: 403,
      });
    }

    // 4. Regular admins cannot modify other admin accounts
    if (currentUser.role === "admin" && performingUser.role === "admin") {
      return returnError({
        message: "Admins cannot modify other admin accounts",
        status: 403,
      });
    }

    // 5. Prevent role escalation - regular admins cannot assign admin role
    if (userData.role === "admin" && performingUser.role === "admin") {
      return returnError({
        message: "Admins cannot assign admin role to other users",
        status: 403,
      });
    }

    // 6. Check if trying to demote the last admin
    if (
      currentUser.role === "admin" &&
      userData.role &&
      userData.role !== "admin"
    ) {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return returnError({
          message: "Cannot demote the last admin user",
          status: 400,
        });
      }
    }

    // 7. Check if trying to deactivate the last admin
    if (currentUser.role === "admin" && userData.isActive === false) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
        _id: { $ne: userId }, // Exclude current user from count
      });
      if (activeAdminCount < 1) {
        return returnError({
          message: "Cannot deactivate the last active admin user",
          status: 400,
        });
      }
    }

    // Prepare update data
    const updatePayload: any = { ...userData };

    // Hash password if provided
    if (password) {
      updatePayload.password = await bcrypt.hash(password, 12);
    }

    if (userData.role && userData.role !== currentUser.role) {
      updatedRole = true;
    }

    // Update user
    const updatedUser:IUser | null = await User.findByIdAndUpdate(userId, updatePayload, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean() as any;

    // Log the update
    const { ip, userAgent } = getClientInfo(request);

    

    if ( updatedRole && updatedUser && ["moderator",  'admin', 'super_admin'].includes(updatedUser.role)) {
      // Role change notification
      await NotificationService.createRoleChangedNotification({
        actor: {
          userId: performingUser._id.toString(),  // Convert to string
          name: performingUser.name,
          email: performingUser.email,
        },
        oldRole: oldRole,
        newRole: updatedUser.role,
        changedUser: {
          userId: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    }

    await Logger.logUserUpdate(
      userId,
      performingUser._id,
      currentUser,
      updatedUser,
      ip,
      userAgent,
      reason
    );

    return returnSuccess({
      data: { user: updatedUser },
      message: "User updated successfully",
    });
  } catch (error: any) {
    const userId = request.url.split("/").pop()!;
    try {
      const performedBy = (request as any).user?.id;
      const { ip } = getClientInfo(request);

      if (performedBy) {
        await Logger.log({
          action: "update",
          entity: "User",
          entityId: userId,
          performedBy,
          metadata: {
            reason: "Update failed",
            error: error?.message,
          },
          ip,
          status: "failed",
          severity: "medium",
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    if (error.name === "ZodError") {
      return returnError({
        message: "Invalid input data",
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: "Failed to update user",
      error: error.message,
      status: 500,
    });
  }
}

async function deleteUserHandler(request: NextRequest) {
  try {
    await connectDB();
    const reason = "Admin requested deletion";

    const userId = request.url.split("/").pop();
    if (!userId) {
      return returnError({
        message: "User ID is required",
        status: 400,
      });
    }

    const userToDelete: UserType = (await User.findById(userId).lean()) as any;
    if (!userToDelete) {
      return returnError({
        message: "User not found",
        status: 404,
      });
    }

    const performingUser = (request as any).user;

    // Security checks
    // 1. Prevent self-deletion
    if (userId === performingUser._id) {
      return returnError({
        message: "You cannot delete yourself",
        status: 403,
      });
    }

    // 2. Only super_admin can delete super_admin accounts
    if (
      userToDelete.role === "super_admin" &&
      performingUser.role !== "super_admin"
    ) {
      return returnError({
        message: "Only super admins can delete super admin accounts",
        status: 403,
      });
    }

    // 3. Regular admins cannot delete other admin accounts
    if (userToDelete.role === "admin" && performingUser.role === "admin") {
      return returnError({
        message: "Admins cannot delete other admin accounts",
        status: 403,
      });
    }

    // 4. Don't allow deleting the last admin
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return returnError({
          message: "Cannot delete the last admin user",
          status: 400,
        });
      }
    }

    // 5. Don't allow deleting the last super_admin
    if (userToDelete.role === "super_admin") {
      const superAdminCount = await User.countDocuments({
        role: "super_admin",
      });
      if (superAdminCount <= 1) {
        return returnError({
          message: "Cannot delete the last super admin user",
          status: 400,
        });
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    const { ip, userAgent } = getClientInfo(request);
    await Logger.logUserDeletion(
      userId,
      performingUser._id,
      userToDelete,
      ip,
      userAgent,
      reason
    );

    return returnSuccess({
      data: {
        deletedUserId: userId,
        deletedUserEmail: userToDelete.email,
      },
      message: "User deleted successfully",
    });
  } catch (error: any) {
    const userId = request.url.split("/").pop()!;
    try {
      const performedBy = (request as any).user?.id;
      const { ip } = getClientInfo(request);

      if (performedBy) {
        await Logger.log({
          action: "delete",
          entity: "User",
          entityId: userId,
          performedBy,
          metadata: {
            reason: "Delete failed",
            error: error?.message,
          },
          ip,
          status: "failed",
          severity: "high",
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return returnError({
      message: "Failed to delete user",
      error: error.message,
      status: 500,
    });
  }
}

export const PUT = withAuth(updateUserHandler, {
  roles: ["admin", "super_admin"],
});
export const DELETE = withAuth(deleteUserHandler, {
  roles: ["admin", "super_admin"],
});
