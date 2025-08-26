// lib/notificationService.ts
import Notification, { NotificationType, INotification } from '@/models/Notification';

import { stripHtmlTags } from './email';
import { connectDB } from './mongoose';
// import { stripHtmlTags } from '@/lib/htmlUtils';

interface UserData {
  userId: string;
  name: string;
  email: string;
}

interface TaskData {
  taskId: string;
  title: string;
  assignedBy: UserData;
  assignedTo: UserData;
}

interface RoleChangeData{
  actor:UserData;
  oldRole:string;
  newRole:string;
  changedUser:UserData
}

export interface LoginAlertData {
  user: UserData;
  ipAddress: string;
  location?: string;
  userAgent?: string;
  loginTime: Date;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export interface SecurityAlertData {
  user: UserData;
  alertType: 'password_changed' | 'email_changed' | 'suspicious_activity' | 'failed_login_attempts' | 'two_factor_enabled' | 'two_factor_disabled';
  details: string;
  ipAddress?: string;
  location?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface SystemAnnouncementData {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetUsers?: UserData[]; // If not provided, sends to all users
  actionUrl?: string;
  category?: 'maintenance' | 'feature' | 'security' | 'general';
  expiresAt?: Date;
}

export interface AccountUpdateData {
  user: UserData;
  updateType: 'profile' | 'email' | 'password' | 'preferences' | 'avatar' | 'phone' | 'address';
  details: string;
  actor?: UserData; // If someone else made the change (admin)
  oldValue?: string;
  newValue?: string;
}

export interface MessageNotificationData {
  message: string;
  recipient: UserData;
  actor: UserData;
  conversationId?: string;
  messageType?: 'direct' | 'group' | 'channel';
  groupName?: string;
  channelName?: string;
}

export interface BulkNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  recipient: UserData;
  actor?: UserData;
  task?: {
    taskId: string;
    title: string;
  };
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<string, number>;
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  includeRead?: boolean;
  includeArchived?: boolean;
  type?: NotificationType;
  priority?: 'low' | 'medium' | 'high';
  dateFrom?: Date;
  dateTo?: Date;
}

export class NotificationService {
  
  // Initialize database connection
   // Initialize database connection
   private static async ensureConnection() {
    await connectDB();
  }

  // Create notification for role changes
  static async createRoleChangedNotification(roleData: RoleChangeData): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      // Don't create notification if user changes their own role (admin override scenario)
      const isSystemChange = roleData.actor.userId === roleData.changedUser.userId;
      
      const message = isSystemChange 
        ? `Your role has been changed from ${roleData.oldRole} to ${roleData.newRole}`
        : `${roleData.actor.name} changed your role from ${roleData.oldRole} to ${roleData.newRole}`;

      const notification = await Notification.create({
        type: 'role_changed',
        title: 'Role Updated',
        message,
        recipient: {
          userId: roleData.changedUser.userId,
          name: roleData.changedUser.name,
          email: roleData.changedUser.email
        },
        actor: !isSystemChange ? {
          userId: roleData.actor.userId,
          name: roleData.actor.name,
          email: roleData.actor.email
        } : undefined,
        priority: 'high',
        actionUrl: '/dashboard/profile',
        metadata: {
          oldRole: roleData.oldRole,
          newRole: roleData.newRole,
          isSystemChange
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating role changed notification:', error);
      return null;
    }
  }

  // Create login alert notification
  static async createLoginAlertNotification(loginData: LoginAlertData): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      const locationText = loginData.location ? ` from ${loginData.location}` : '';
      const message = `New login detected${locationText} at ${loginData.loginTime.toLocaleString()}. IP: ${loginData.ipAddress}`;

      const notification = await Notification.create({
        type: 'login_alert',
        title: 'New Login Detected',
        message,
        recipient: {
          userId: loginData.user.userId,
          name: loginData.user.name,
          email: loginData.user.email
        },
        priority: 'medium',
        actionUrl: '/dashboard/security',
        metadata: {
          ipAddress: loginData.ipAddress,
          location: loginData.location,
          userAgent: loginData.userAgent,
          loginTime: loginData.loginTime
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating login alert notification:', error);
      return null;
    }
  }

  // Create security alert notification
  static async createSecurityAlertNotification(alertData: SecurityAlertData): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      const alertTitles = {
        password_changed: 'Password Changed',
        email_changed: 'Email Address Updated',
        suspicious_activity: 'Suspicious Activity Detected',
        failed_login_attempts: 'Multiple Failed Login Attempts'
      };

      const title = alertTitles[alertData.alertType as keyof typeof alertTitles] || 'Security Alert';
      
      const notification = await Notification.create({
        type: 'security_alert',
        title,
        message: alertData.details,
        recipient: {
          userId: alertData.user.userId,
          name: alertData.user.name,
          email: alertData.user.email
        },
        priority: alertData.alertType === 'suspicious_activity' ? 'high' : 'medium',
        actionUrl: '/dashboard/security',
        metadata: {
          alertType: alertData.alertType,
          ipAddress: alertData.ipAddress,
          timestamp: new Date()
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating security alert notification:', error);
      return null;
    }
  }

  // Create account update notification
  static async createAccountUpdateNotification(
    user: UserData,
    updateType: string,
    details: string,
    actor?: UserData
  ): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      const isSystemUpdate = !actor;
      const message = isSystemUpdate 
        ? `Your ${updateType} has been updated: ${details}`
        : `${actor.name} updated your ${updateType}: ${details}`;

      const notification = await Notification.create({
        type: 'account_update',
        title: 'Account Updated',
        message,
        recipient: {
          userId: user.userId,
          name: user.name,
          email: user.email
        },
        actor: actor ? {
          userId: actor.userId,
          name: actor.name,
          email: actor.email
        } : undefined,
        priority: 'low',
        actionUrl: '/dashboard/profile',
        metadata: {
          updateType,
          details,
          isSystemUpdate
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating account update notification:', error);
      return null;
    }
  }

  // Create system announcement notification
  static async createSystemAnnouncementNotification(
    announcementData: SystemAnnouncementData
  ): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      const notifications: INotification[] = [];
      
      // If no target users specified, this would typically send to all users
      // For now, we'll require target users to be specified
      if (!announcementData.targetUsers || announcementData.targetUsers.length === 0) {
        console.warn('No target users specified for system announcement');
        return notifications;
      }

      for (const user of announcementData.targetUsers) {
        try {
          const notification = await Notification.create({
            type: 'system_announcement',
            title: announcementData.title,
            message: announcementData.message,
            recipient: {
              userId: user.userId,
              name: user.name,
              email: user.email
            },
            priority: announcementData.priority,
            actionUrl: announcementData.actionUrl,
            metadata: {
              isSystemAnnouncement: true,
              announcementId: `announcement_${Date.now()}`
            }
          });

          notifications.push(notification);
        } catch (error) {
          console.error(`Error creating announcement notification for user ${user.userId}:`, error);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating system announcement notifications:', error);
      return [];
    }
  }

  // Create new message notification (enhanced version of existing method)
  static async createNewMessageNotification(
    message: string,
    recipient: UserData,
    actor: UserData,
    conversationId?: string,
    messageType: 'direct' | 'group' | 'channel' = 'direct'
  ): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      // Don't create notification if user messages themselves
      if (actor.userId === recipient.userId) {
        return null;
      }

      const truncatedMessage = stripHtmlTags(message).substring(0, 100) + 
        (message.length > 100 ? '...' : '');

      const typeMessages = {
        direct: `${actor.name} sent you a message: ${truncatedMessage}`,
        group: `${actor.name} sent a message in group: ${truncatedMessage}`,
        channel: `${actor.name} posted in channel: ${truncatedMessage}`
      };

      const notification = await Notification.create({
        type: 'new_message',
        title: 'New Message',
        message: typeMessages[messageType],
        recipient: {
          userId: recipient.userId,
          name: recipient.name,
          email: recipient.email
        },
        actor: {
          userId: actor.userId,
          name: actor.name,
          email: actor.email
        },
        priority: messageType === 'direct' ? 'medium' : 'low',
        actionUrl: conversationId ? `/dashboard/messages/${conversationId}` : '/dashboard/messages',
        metadata: {
          originalMessage: truncatedMessage,
          messageType,
          conversationId
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating new message notification:', error);
      return null;
    }
  }

  // Bulk create notifications (utility method)
  static async createBulkNotifications(
    notificationData: Array<{
      type: NotificationType;
      title: string;
      message: string;
      recipient: UserData;
      actor?: UserData;
      priority?: 'low' | 'medium' | 'high';
      actionUrl?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      const notifications = await Notification.insertMany(
        notificationData.map(data => ({
          ...data,
          recipient: {
            userId: data.recipient.userId,
            name: data.recipient.name,
            email: data.recipient.email
          },
          actor: data.actor ? {
            userId: data.actor.userId,
            name: data.actor.name,
            email: data.actor.email
          } : undefined,
          priority: data.priority || 'medium',
          metadata: data.metadata || {}
        }))
      );

      return notifications as unknown as INotification[] ;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return [];
    }
  }

  // Get notification statistics for a user
  static async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      await this.ensureConnection();
      
      const [total, unread, byType, byPriority] = await Promise.all([
        // Total notifications
        Notification.countDocuments({
          'recipient.userId': userId,
          isArchived: false
        }),
        
        // Unread notifications
        Notification.countDocuments({
          'recipient.userId': userId,
          isRead: false,
          isArchived: false
        }),
        
        // By type
        Notification.aggregate([
          { $match: { 'recipient.userId': userId, isArchived: false } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        
        // By priority
        Notification.aggregate([
          { $match: { 'recipient.userId': userId, isArchived: false } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ])
      ]);

      const typeStats = byType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const priorityStats = byPriority.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        total,
        unread,
        byType: typeStats,
        byPriority: priorityStats
      };
    } catch (error) {
      console.error('Error getting user notification stats:', error);
      return {
        total: 0,
        unread: 0,
        byType: {} as Record<NotificationType, number>,
        byPriority: {}
      };
    }
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    try {
      await this.ensureConnection();
      
      const result = await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          isRead: false
        },
        { 
          isRead: true,
          readAt: new Date()
        }
      );

      return result.modifiedCount || 0;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      return 0;
    }
  }

  // Create notification for task assignment
  static async createTaskAssignedNotification(
    taskData: TaskData
  ): Promise<INotification | null> {
    try {
      await this.ensureConnection();
      
      // Don't create notification if user assigns task to themselves
      if (taskData.assignedBy.userId === taskData.assignedTo.userId) {
        return null;
      }

      const notification = await Notification.create({
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${taskData.assignedBy.name} assigned you a new task: "${taskData.title}"`,
        recipient: {
          userId: taskData.assignedTo.userId,
          name: taskData.assignedTo.name,
          email: taskData.assignedTo.email
        },
        actor: {
          userId: taskData.assignedBy.userId,
          name: taskData.assignedBy.name,
          email: taskData.assignedBy.email
        },
        task: {
          taskId: taskData.taskId,
          title: taskData.title
        },
        priority: 'high',
        actionUrl: `/dashboard/tasks/${taskData.taskId}`
      });

      return notification;
    } catch (error) {
      console.error('Error creating task assigned notification:', error);
      return null;
    }
  }

  // Create notifications for task comments
  static async createTaskCommentNotifications(
    taskData: TaskData,
    commenter: UserData,
    commentText: string,
    existingCommenters: UserData[] = []
  ): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      const notifications: INotification[] = [];
      const commentPreview = stripHtmlTags(commentText).substring(0, 100) + 
        (commentText.length > 100 ? '...' : '');

      // Get unique users to notify (task creator, assignee, and other commenters)
      const usersToNotify = new Map<string, UserData>();

      // Add task creator (if different from commenter)
      if (taskData.assignedBy.userId !== commenter.userId) {
        usersToNotify.set(taskData.assignedBy.userId, taskData.assignedBy);
      }

      // Add task assignee (if different from commenter)
      if (taskData.assignedTo.userId !== commenter.userId) {
        usersToNotify.set(taskData.assignedTo.userId, taskData.assignedTo);
      }

      // Add other commenters (if different from commenter)
      existingCommenters.forEach(user => {
        if (user.userId !== commenter.userId) {
          usersToNotify.set(user.userId, user);
        }
      });

      // Create notifications for all relevant users
      for (const [userId, userData] of usersToNotify) {
        try {
          const notification = await Notification.create({
            type: 'task_comment',
            title: 'New Comment',
            message: `${commenter.name} commented on "${taskData.title}": ${commentPreview}`,
            recipient: {
              userId: userData.userId,
              name: userData.name,
              email: userData.email
            },
            actor: {
              userId: commenter.userId,
              name: commenter.name,
              email: commenter.email
            },
            task: {
              taskId: taskData.taskId,
              title: taskData.title
            },
            priority: 'medium',
            actionUrl: `/dashboard/tasks/${taskData.taskId}`,
            metadata: {
              commentPreview
            }
          });

          notifications.push(notification);
        } catch (error) {
          console.error(`Error creating comment notification for user ${userId}:`, error);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating task comment notifications:', error);
      return [];
    }
  }

  // Create notification for task status change
  static async createTaskStatusChangedNotification(
    taskData: TaskData,
    updater: UserData,
    oldStatus: string,
    newStatus: string
  ): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      const notifications: INotification[] = [];
      
      const statusMessages = {
        pending: 'moved to pending',
        in_progress: 'started working on',
        completed: 'completed',
        cancelled: 'cancelled'
      };

      const message = `${updater.name} ${statusMessages[newStatus as keyof typeof statusMessages] || 'updated'} "${taskData.title}"`;
      
      // Notify task creator if different from updater
      if (taskData.assignedBy.userId !== updater.userId) {
        try {
          const notification = await Notification.create({
            type: 'task_status_changed',
            title: 'Task Status Updated',
            message,
            recipient: {
              userId: taskData.assignedBy.userId,
              name: taskData.assignedBy.name,
              email: taskData.assignedBy.email
            },
            actor: {
              userId: updater.userId,
              name: updater.name,
              email: updater.email
            },
            task: {
              taskId: taskData.taskId,
              title: taskData.title
            },
            priority: newStatus === 'completed' ? 'high' : 'medium',
            actionUrl: `/dashboard/tasks/${taskData.taskId}`,
            metadata: {
              oldStatus,
              newStatus
            }
          });

          notifications.push(notification);
        } catch (error) {
          console.error('Error creating status notification for task creator:', error);
        }
      }

      // Notify task assignee if different from updater
      if (taskData.assignedTo.userId !== updater.userId) {
        try {
          const notification = await Notification.create({
            type: 'task_status_changed',
            title: 'Task Status Updated',
            message,
            recipient: {
              userId: taskData.assignedTo.userId,
              name: taskData.assignedTo.name,
              email: taskData.assignedTo.email
            },
            actor: {
              userId: updater.userId,
              name: updater.name,
              email: updater.email
            },
            task: {
              taskId: taskData.taskId,
              title: taskData.title
            },
            priority: newStatus === 'completed' ? 'high' : 'medium',
            actionUrl: `/dashboard/tasks/${taskData.taskId}`,
            metadata: {
              oldStatus,
              newStatus
            }
          });

          notifications.push(notification);
        } catch (error) {
          console.error('Error creating status notification for task assignee:', error);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating task status changed notifications:', error);
      return [];
    }
  }

  // Create overdue task notifications (for scheduled jobs)
  static async createOverdueTaskNotifications(): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      // This would typically be called by a scheduled job
      // Find tasks that are overdue and haven't been notified yet
      const Task = (await import('@/models/Task')).default;
      
      const overdueTasks = await Task.find({
        dueDate: { $lt: new Date() },
        status: { $in: ['pending', 'in_progress'] },
        // Add a field to track if overdue notification was sent
        // overdueNotificationSent: { $ne: true }
      }).lean();

      const notifications: INotification[] = [];

      for (const task of overdueTasks) {
        try {
          // Notify assignee
          const notification = await Notification.create({
            type: 'task_overdue',
            title: 'Task Overdue',
            message: `Task "${task.title}" is overdue and needs your attention`,
            recipient: {
              userId: task.assignedTo.userId,
              name: task.assignedTo.name,
              email: task.assignedTo.email
            },
            task: {
              taskId: task._id,
              title: task.title
            },
            priority: 'high',
            actionUrl: `/dashboard/tasks/${task._id}`
          });

          notifications.push(notification);

          // Mark task as notified (you'd need to add this field to Task model)
          // await Task.updateOne({ _id: task._id }, { overdueNotificationSent: true });

        } catch (error) {
          console.error(`Error creating overdue notification for task ${task._id}:`, error);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating overdue task notifications:', error);
      return [];
    }
  }

  // Create due soon notifications (for scheduled jobs)
  static async createDueSoonNotifications(): Promise<INotification[]> {
    try {
      await this.ensureConnection();
      
      // Find tasks due within next 24 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const Task = (await import('@/models/Task')).default;
      
      const dueSoonTasks = await Task.find({
        dueDate: { 
          $gte: new Date(),
          $lte: tomorrow 
        },
        status: { $in: ['pending', 'in_progress'] },
        // dueSoonNotificationSent: { $ne: true }
      }).lean();

      const notifications: INotification[] = [];

      for (const task of dueSoonTasks) {
        try {
          const notification = await Notification.create({
            type: 'task_due_soon',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due tomorrow`,
            recipient: {
              userId: task.assignedTo.userId,
              name: task.assignedTo.name,
              email: task.assignedTo.email
            },
            task: {
              taskId: task._id,
              title: task.title
            },
            priority: 'medium',
            actionUrl: `/dashboard/tasks/${task._id}`
          });

          notifications.push(notification);

          // Mark as notified
          // await Task.updateOne({ _id: task._id }, { dueSoonNotificationSent: true });

        } catch (error) {
          console.error(`Error creating due soon notification for task ${task._id}:`, error);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating due soon notifications:', error);
      return [];
    }
  }

  // Utility method to get unique commenters from a task
  static getUniqueCommenters(comments: any[]): UserData[] {
    const commentersMap = new Map<string, UserData>();
    
    comments.forEach(comment => {
      if (!commentersMap.has(comment.userId)) {
        commentersMap.set(comment.userId, {
          userId: comment.userId,
          name: comment.userName,
          email: '' // Email might not be available in comments
        });
      }
    });

    return Array.from(commentersMap.values());
  }

  // Clean up old read notifications (for maintenance)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      await this.ensureConnection();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        isRead: true,
        isArchived: true,
        createdAt: { $lt: cutoffDate }
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}

export default NotificationService;



//usage examples

// Role change notification
// await NotificationService.createRoleChangedNotification({
//   actor: { userId: "admin123", name: "Admin User", email: "admin@example.com" },
//   oldRole: "user",
//   newRole: "moderator",
//   changedUser: { userId: "user123", name: "John Doe", email: "john@example.com" }
// });

// // Login alert
// await NotificationService.createLoginAlertNotification({
//   user: { userId: "user123", name: "John Doe", email: "john@example.com" },
//   ipAddress: "192.168.1.100",
//   location: "New York, US",
//   userAgent: "Chrome/91.0",
//   loginTime: new Date()
// });

// // Security alert
// await NotificationService.createSecurityAlertNotification({
//   user: { userId: "user123", name: "John Doe", email: "john@example.com" },
//   alertType: "password_changed",
//   details: "Your password was successfully changed from a new device",
//   ipAddress: "192.168.1.100"
// });