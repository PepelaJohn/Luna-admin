// models/Notification.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Notification types
export type NotificationType = 
  | 'task_assigned'      // When a task is assigned to you
  | 'task_completed'     // When a task you assigned is completed
  | 'task_status_changed' // When task status changes
  | 'task_comment'       // When someone comments on a task
  | 'task_overdue'       // When a task becomes overdue
  | 'task_due_soon';     // When a task is due soon

// Interface for User reference in notifications
export interface INotificationUser {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

// Interface for Task reference in notifications
export interface INotificationTask {
  taskId: mongoose.Types.ObjectId;
  title: string;
}

// Main Notification interface
export interface INotification extends Document {
  // Core fields
  type: NotificationType;
  title: string;
  message: string;
  
  // Users involved
  recipient: INotificationUser;  // Who receives the notification
  actor: INotificationUser;      // Who performed the action (optional)
  
  // Related entities
  task?: INotificationTask;      // Related task (if applicable)
  
  // Metadata
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high';
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
  
  // Action URL (where to go when clicked)
  actionUrl?: string;
  
  // Additional data (flexible for different notification types)
  metadata?: Record<string, any>;
  
  // Instance methods
  markAsRead(): Promise<INotification>;
  archive(): Promise<INotification>;
}

// User reference schema
const NotificationUserSchema = new Schema<INotificationUser>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, { _id: false });

// Task reference schema
const NotificationTaskSchema = new Schema<INotificationTask>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  title: {
    type: String,
    required: true
  }
}, { _id: false });

// Main Notification schema
const NotificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['task_assigned', 'task_completed', 'task_status_changed', 'task_comment', 'task_overdue', 'task_due_soon'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000
  },
  recipient: {
    type: NotificationUserSchema,
    required: true
  },
  actor: {
    type: NotificationUserSchema,
    required: false
  },
  task: {
    type: NotificationTaskSchema,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  readAt: {
    type: Date
  },
  archivedAt: {
    type: Date
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time since creation
NotificationSchema.virtual('timeAgo').get(function(this: INotification) {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return created.toLocaleDateString();
});

// Instance method to mark as read
NotificationSchema.methods.markAsRead = async function(this: INotification): Promise<INotification> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

// Instance method to archive
NotificationSchema.methods.archive = async function(this: INotification): Promise<INotification> {
  if (!this.isArchived) {
    this.isArchived = true;
    this.archivedAt = new Date();
    return await this.save();
  }
  return this;
};

// Indexes for performance
NotificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
NotificationSchema.index({ 'recipient.userId': 1, isRead: 1 });
NotificationSchema.index({ 'recipient.userId': 1, isArchived: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Static methods for creating different types of notifications
NotificationSchema.statics.createTaskAssignedNotification = async function(
  taskData: { taskId: string; title: string },
  recipient: { userId: string; name: string; email: string },
  actor: { userId: string; name: string; email: string }
) {
  return this.create({
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `${actor.name} assigned you a new task: "${taskData.title}"`,
    recipient: {
      userId: new mongoose.Types.ObjectId(recipient.userId),
      name: recipient.name,
      email: recipient.email
    },
    actor: {
      userId: new mongoose.Types.ObjectId(actor.userId),
      name: actor.name,
      email: actor.email
    },
    task: {
      taskId: new mongoose.Types.ObjectId(taskData.taskId),
      title: taskData.title
    },
    priority: 'high',
    actionUrl: `/dashboard/tasks/${taskData.taskId}`
  });
};

NotificationSchema.statics.createTaskCommentNotification = async function(
  taskData: { taskId: string; title: string },
  recipient: { userId: string; name: string; email: string },
  actor: { userId: string; name: string; email: string },
  commentPreview: string
) {
  return this.create({
    type: 'task_comment',
    title: 'New Comment',
    message: `${actor.name} commented on "${taskData.title}": ${commentPreview}`,
    recipient: {
      userId: new mongoose.Types.ObjectId(recipient.userId),
      name: recipient.name,
      email: recipient.email
    },
    actor: {
      userId: new mongoose.Types.ObjectId(actor.userId),
      name: actor.name,
      email: actor.email
    },
    task: {
      taskId: new mongoose.Types.ObjectId(taskData.taskId),
      title: taskData.title
    },
    priority: 'medium',
    actionUrl: `/dashboard/tasks/${taskData.taskId}`,
    metadata: {
      commentPreview
    }
  });
};

NotificationSchema.statics.createTaskStatusChangedNotification = async function(
  taskData: { taskId: string; title: string },
  recipient: { userId: string; name: string; email: string },
  actor: { userId: string; name: string; email: string },
  oldStatus: string,
  newStatus: string
) {
  const statusMessages = {
    pending: 'moved to pending',
    in_progress: 'started working on',
    completed: 'completed',
    cancelled: 'cancelled'
  };

  const message = `${actor.name} ${statusMessages[newStatus as keyof typeof statusMessages] || 'updated'} "${taskData.title}"`;
  
  return this.create({
    type: 'task_status_changed',
    title: 'Task Status Updated',
    message,
    recipient: {
      userId: new mongoose.Types.ObjectId(recipient.userId),
      name: recipient.name,
      email: recipient.email
    },
    actor: {
      userId: new mongoose.Types.ObjectId(actor.userId),
      name: actor.name,
      email: actor.email
    },
    task: {
      taskId: new mongoose.Types.ObjectId(taskData.taskId),
      title: taskData.title
    },
    priority: newStatus === 'completed' ? 'high' : 'medium',
    actionUrl: `/dashboard/tasks/${taskData.taskId}`,
    metadata: {
      oldStatus,
      newStatus
    }
  });
};

// Static method to get notifications for a user
NotificationSchema.statics.getForUser = function(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    includeRead?: boolean;
    includeArchived?: boolean;
    type?: NotificationType;
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    includeRead = true,
    includeArchived = false,
    type
  } = options;

  const filters: any = {
    'recipient.userId': new mongoose.Types.ObjectId(userId)
  };

  if (!includeRead) {
    filters.isRead = false;
  }

  if (!includeArchived) {
    filters.isArchived = false;
  }

  if (type) {
    filters.type = type;
  }

  const skip = (page - 1) * limit;

  return this.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({
    'recipient.userId': new mongoose.Types.ObjectId(userId),
    isRead: false,
    isArchived: false
  });
};

// Create and export the model
const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;