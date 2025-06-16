// models/Task.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for Comment subdocument
export interface IComment {
  userId: mongoose.Types.ObjectId;
  userName: string;
  message: string;
  createdAt: Date;
}

// Interface for User reference
export interface IUserRef {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

// Main Task interface
export interface ITask extends Document {
  title: string;
  description: string;
  assignedBy: IUserRef;
  assignedTo: IUserRef;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  category: string;
  attachments: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Instance methods
  addComment(userId: string, userName: string, message: string): Promise<ITask>;
  updateStatus(newStatus: ITask['status'], completedAt?: Date): Promise<ITask>;
  canUserAccess(userId: string, userRole: string): boolean;
}

// Comment schema
const CommentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User reference schema
const UserRefSchema = new Schema<IUserRef>({
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
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    required: true
  }
}, { _id: false });

// Main Task schema
const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  assignedBy: {
    type: UserRefSchema,
    required: true
  },
  assignedTo: {
    type: UserRefSchema,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(this: ITask, value: Date) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'user_management',
      'system_config',
      'content_review',
      'security_audit',
      'data_analysis',
      'maintenance',
      'support',
      'other'
    ]
  },
  attachments: [{
    type: String,
    trim: true
  }],
  comments: [CommentSchema],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function(this: ITask) {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for task age in days
TaskSchema.virtual('ageInDays').get(function(this: ITask) {
  const now = new Date();
 const created = new Date(this.createdAt as unknown as string);

  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to add comment
TaskSchema.methods.addComment = async function(
  this: ITask,
  userId: string,
  userName: string,
  message: string
): Promise<ITask> {
  this.comments.push({
    userId: new mongoose.Types.ObjectId(userId),
    userName,
    message: message.trim(),
    createdAt: new Date()
  } as IComment);
  
  return await this.save();
};

// Instance method to update status
TaskSchema.methods.updateStatus = async function(
  this: ITask,
  newStatus: ITask['status'],
  completedAt?: Date
): Promise<ITask> {
  this.status = newStatus;
  
  if (newStatus === 'completed' && !this.completedAt) {
    this.completedAt = completedAt || new Date();
  } else if (newStatus !== 'completed') {
    this.completedAt = undefined;
  }
  
  return await this.save();
};

// Instance method to check user access
TaskSchema.methods.canUserAccess = function(
  this: ITask,
  userId: string,
  userRole: string
): boolean {
  // Super admin can access all tasks
  if (userRole === 'super_admin') return true;
  
  // User can access tasks they assigned or were assigned to
  return (
    this.assignedTo.userId.toString() === userId ||
    this.assignedBy.userId.toString() === userId
  );
};

// Indexes for performance
TaskSchema.index({ 'assignedTo.userId': 1, status: 1 });
TaskSchema.index({ 'assignedBy.userId': 1, status: 1 });
TaskSchema.index({ status: 1, priority: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ createdAt: -1 });

// Static methods
TaskSchema.statics.getTasksByUser = function(
  userId: string,
  userRole: string,
  filters: any = {}
) {
  const baseQuery = userRole === 'super_admin' 
    ? {} 
    : {
        $or: [
          { 'assignedTo.userId': new mongoose.Types.ObjectId(userId) },
          { 'assignedBy.userId': new mongoose.Types.ObjectId(userId) }
        ]
      };

  return this.find({ ...baseQuery, ...filters })
    .sort({ createdAt: -1 })
    .lean();
};

TaskSchema.statics.getTaskStats = function(userId: string, userRole: string) {
  const matchStage = userRole === 'super_admin'
    ? {}
    : {
        $or: [
          { 'assignedTo.userId': new mongoose.Types.ObjectId(userId) },
          { 'assignedBy.userId': new mongoose.Types.ObjectId(userId) }
        ]
      };

  return this.aggregate([
    { $match: matchStage },
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
        }
      }
    }
  ]);
};

// Pre-save middleware
TaskSchema.pre('save', function(this: ITask, next) {
  // Ensure assignedBy and assignedTo are different users
  if (this.assignedBy.userId.toString() === this.assignedTo.userId.toString()) {
    const error = new Error('Cannot assign task to yourself');
    return next(error);
  }
  next();
});

// Create and export the model
const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;