// lib/notificationScheduler.ts
import { connectDB } from './mongoose';
import NotificationService from './notificationService';
import Task from '@/models/Task';


export class NotificationScheduler {
  
  // Create overdue notifications for tasks
  static async processOverdueTasks(): Promise<{ success: number; failed: number }> {
    try {
      await connectDB();
      
      console.log('Processing overdue tasks...');
      
      // Find tasks that are overdue and haven't been notified in the last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const overdueTasks = await Task.find({
        dueDate: { $lt: now },
        status: { $in: ['pending', 'in_progress'] },
        // Only notify if we haven't notified in the last 24 hours
        $or: [
          { lastOverdueNotification: { $exists: false } },
          { lastOverdueNotification: { $lt: yesterday } }
        ]
      }).lean();

      let success = 0;
      let failed = 0;

      for (const task of overdueTasks) {
        try {
          // Create notification for assignee
          await NotificationService.createTaskAssignedNotification({
            taskId: task._id.toString(),
            title: `OVERDUE: ${task.title}`,
            assignedBy: task.assignedBy as any,
            assignedTo: task.assignedTo as any
          });

          // Also notify the task creator if different from assignee
          if (task.assignedBy.userId.toString() !== task.assignedTo.userId.toString()) {
            // Create custom overdue notification for creator
            const Notification = (await import('@/models/Notification')).default;
            await Notification.create({
              type: 'task_overdue',
              title: 'Task Overdue',
              message: `Task "${task.title}" assigned to ${task.assignedTo.name} is overdue`,
              recipient: {
                userId: task.assignedBy.userId,
                name: task.assignedBy.name,
                email: task.assignedBy.email
              },
              task: {
                taskId: task._id,
                title: task.title
              },
              priority: 'high',
              actionUrl: `/dashboard/tasks/${task._id}`
            });
          }

          // Update task to mark as notified
          await Task.updateOne(
            { _id: task._id },
            { lastOverdueNotification: now }
          );

          success++;
          console.log(`Created overdue notification for task: ${task.title}`);

        } catch (error) {
          console.error(`Failed to create overdue notification for task ${task._id}:`, error);
          failed++;
        }
      }

      console.log(`Processed overdue tasks: ${success} success, ${failed} failed`);
      return { success, failed };

    } catch (error) {
      console.error('Error processing overdue tasks:', error);
      return { success: 0, failed: 0 };
    }
  }

  // Create due soon notifications for tasks
  static async processDueSoonTasks(): Promise<{ success: number; failed: number }> {
    try {
      await connectDB();
      
      console.log('Processing due soon tasks...');
      
      // Find tasks due within next 24 hours that haven't been notified
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const dueSoonTasks = await Task.find({
        dueDate: { 
          $gte: now,
          $lte: tomorrow 
        },
        status: { $in: ['pending', 'in_progress'] },
        // Only notify if we haven't notified in the last 24 hours
        $or: [
          { lastDueSoonNotification: { $exists: false } },
          { lastDueSoonNotification: { $lt: yesterday } }
        ]
      }).lean();

      let success = 0;
      let failed = 0;

      for (const task of dueSoonTasks) {
        try {
          const hoursUntilDue = Math.round((new Date(task.dueDate as any).getTime() - now.getTime()) / (1000 * 60 * 60));
          const timeMessage = hoursUntilDue < 1 ? 'due very soon' : 
                             hoursUntilDue === 1 ? 'due in 1 hour' :
                             hoursUntilDue < 24 ? `due in ${hoursUntilDue} hours` : 'due tomorrow';

          // Create notification for assignee
          const Notification = (await import('@/models/Notification')).default;
          await Notification.create({
            type: 'task_due_soon',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is ${timeMessage}`,
            recipient: {
              userId: task.assignedTo.userId,
              name: task.assignedTo.name,
              email: task.assignedTo.email
            },
            task: {
              taskId: task._id,
              title: task.title
            },
            priority: hoursUntilDue < 6 ? 'high' : 'medium',
            actionUrl: `/dashboard/tasks/${task._id}`,
            metadata: {
              hoursUntilDue,
              dueDate: task.dueDate
            }
          });

          // Update task to mark as notified
          await Task.updateOne(
            { _id: task._id },
            { lastDueSoonNotification: now }
          );

          success++;
          console.log(`Created due soon notification for task: ${task.title}`);

        } catch (error) {
          console.error(`Failed to create due soon notification for task ${task._id}:`, error);
          failed++;
        }
      }

      console.log(`Processed due soon tasks: ${success} success, ${failed} failed`);
      return { success, failed };

    } catch (error) {
      console.error('Error processing due soon tasks:', error);
      return { success: 0, failed: 0 };
    }
  }

  // Clean up old notifications (older than 30 days and read/archived)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      await connectDB();
      
      console.log(`Cleaning up notifications older than ${daysOld} days...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const Notification = (await import('@/models/Notification')).default;
      
      const result = await Notification.deleteMany({
        isRead: true,
        isArchived: true,
        createdAt: { $lt: cutoffDate }
      });

      const deletedCount = result.deletedCount || 0;
      console.log(`Cleaned up ${deletedCount} old notifications`);
      
      return deletedCount;

    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }

  // Process all scheduled notifications
  static async processAllScheduledNotifications(): Promise<{
    overdue: { success: number; failed: number };
    dueSoon: { success: number; failed: number };
    cleanup: number;
  }> {
    console.log('Starting scheduled notification processing...');
    
    const [overdue, dueSoon, cleanup] = await Promise.all([
      this.processOverdueTasks(),
      this.processDueSoonTasks(),
      this.cleanupOldNotifications()
    ]);

    console.log('Completed scheduled notification processing');
    
    return {
      overdue,
      dueSoon,
      cleanup
    };
  }
}



// Cron job setup example (if using node-cron)
/*
import cron from 'node-cron';

export const startNotificationScheduler = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled notifications...');
    await NotificationScheduler.processAllScheduledNotifications();
  });
  
  console.log('Notification scheduler started');
};
*/


export default NotificationScheduler;