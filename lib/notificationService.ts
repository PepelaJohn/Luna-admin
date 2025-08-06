// lib/notificationService.ts
import Notification, { NotificationType, INotification } from '@/models/Notification';
import { connectDB } from '@/lib/db';
import { stripHtmlTags } from './email';
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

export class NotificationService {
  
  // Initialize database connection
  private static async ensureConnection() {
    await connectDB();
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