// app/dashboard/tasks/[id]/page.tsx
"use client"
import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft,
  Calendar,
  User,
  MessageCircle,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Send,
  MoreVertical,
  Tag,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Types
interface IComment {
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface ITask {
  _id: string;
  title: string;
  description: string;
  assignedBy: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  category: string;
  attachments: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isOverdue: boolean;
  ageInDays: number;
}

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 border-gray-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[priority as keyof typeof colors]}`}>
      <Tag className="w-3 h-3 mr-1" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Status Badge Component  
const StatusBadge = ({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  const icons = {
    pending: Clock,
    in_progress: Edit3,
    completed: CheckCircle,
    cancelled: AlertTriangle
  };

  const Icon = icons[status as keyof typeof icons];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border ${colors[status as keyof typeof colors]}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

// Comment Component
const CommentItem = ({ comment, isOwn = false }: { comment: IComment; isOwn?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
      <div className={`rounded-lg p-4 ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-sm font-medium ${isOwn ? 'text-blue-100' : 'text-gray-900'}`}>
            {comment.userName}
          </span>
          <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-700'}`}>
          {comment.message}
        </p>
      </div>
    </div>
    <div className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ${isOwn ? 'order-1' : 'order-2'}`}>
      <User className="w-4 h-4 text-gray-600" />
    </div>
  </motion.div>
);

// Status Update Component
const StatusUpdateForm = ({ 
  currentStatus, 
  taskId, 
  onStatusUpdate,
  currentUser,
  task
}: { 
  currentStatus: string;
  taskId: string;
  onStatusUpdate: (newStatus: string) => void;
  currentUser: any;
  task: ITask;
}) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === currentStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onStatusUpdate(newStatus);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const isAssignee = currentUser?.id === task.assignedTo.userId;
  const isAssigner = currentUser?.id === task.assignedBy.userId;

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {newStatus !== currentStatus && (
          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        )}
      </form>
      <p className="text-xs text-gray-500 mt-2">
        {isAssignee && "You can update this task's status as the assignee."}
        {isAssigner && "You can update this task's status as the task creator."}
        {!isAssignee && !isAssigner && "You have permission to update this task's status."}
      </p>
    </div>
  );
};

// Main Task Detail Component
const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;
  
  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Fetch task details
  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Task not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this task');
        } else {
          setError('Failed to load task');
        }
        return;
      }

      const result = await response.json();
      setTask(result);
    } catch (err) {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user (you might have this in a context or hook)
  useEffect(() => {
    // This is a placeholder - replace with your actual user fetching logic
    // You might have this in a context or get it from a token
    setCurrentUser({ id: 'current-user-id', name: 'Current User' });
  }, []);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // Auto-scroll to bottom of comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task?.comments]);

  // Send comment
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSendingComment(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newComment.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        setTask(prev => prev ? {
          ...prev,
          comments: [...prev.comments, result._doc]
        } : null);
        setNewComment('');
      } else {
        throw new Error('Failed to send comment');
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      alert('Failed to send comment');
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    setTask(prev => prev ? { ...prev, status: newStatus as any } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="flex gap-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={fetchTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              href="/dashboard/tasks/assigned-to-me"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/tasks/assigned-to-me"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
                  {task.title}
                </h2>
                {task.isOverdue && (
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="prose prose-sm max-w-none mb-6">
                <div 
                  className="text-gray-700 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                />
              </div>

              <style jsx>{`
                .rich-text-content {
                  font-family: inherit;
                  line-height: 1.6;
                }
                
                .rich-text-content h1,
                .rich-text-content h2,
                .rich-text-content h3 {
                  font-weight: 600;
                  margin: 1.5rem 0 0.75rem 0;
                  color: #1f2937;
                }
                
                .rich-text-content h1 {
                  font-size: 1.5rem;
                }
                
                .rich-text-content h2 {
                  font-size: 1.25rem;
                }
                
                .rich-text-content h3 {
                  font-size: 1.1rem;
                }
                
                .rich-text-content p {
                  margin: 0.75rem 0;
                  color: #374151;
                }
                
                .rich-text-content ul,
                .rich-text-content ol {
                  margin: 1rem 0;
                  padding-left: 1.5rem;
                }
                
                .rich-text-content li {
                  margin: 0.25rem 0;
                }
                
                .rich-text-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  margin: 1rem 0;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .rich-text-content a {
                  color: #3b82f6;
                  text-decoration: underline;
                }
                
                .rich-text-content a:hover {
                  color: #1d4ed8;
                }
                
                .rich-text-content strong {
                  font-weight: 600;
                  color: #1f2937;
                }
                
                .rich-text-content em {
                  font-style: italic;
                }
                
                .rich-text-content u {
                  text-decoration: underline;
                }
                
                .rich-text-content blockquote {
                  border-left: 4px solid #e5e7eb;
                  margin: 1rem 0;
                  padding-left: 1rem;
                  font-style: italic;
                  color: #6b7280;
                }
              `}</style>

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({task.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
                <StatusUpdateForm 
                  currentStatus={task.status}
                  taskId={task._id}
                  onStatusUpdate={handleStatusUpdate}
                  currentUser={currentUser}
                  task={task}
                />
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({task.comments.length})
                </h3>
              </div>
              
              <div className="p-6">
                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {task.comments.map((comment, index) => (
                      <CommentItem 
                        key={index}
                        comment={comment}
                        isOwn={comment.userId === currentUser?.id}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={commentsEndRef} />
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleSendComment} className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || sendingComment}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {sendingComment ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
              
              {/* Current User Role */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Your Role: {
                      currentUser?.id === task.assignedTo.userId 
                        ? 'Assignee' 
                        : currentUser?.id === task.assignedBy.userId 
                          ? 'Task Creator' 
                          : 'Viewer'
                    }
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {currentUser?.id === task.assignedTo.userId && 'This task is assigned to you'}
                  {currentUser?.id === task.assignedBy.userId && 'You created this task'}
                  {currentUser?.id !== task.assignedTo.userId && currentUser?.id !== task.assignedBy.userId && 'You have access to view this task'}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned By</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{task.assignedBy.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">{task.assignedBy.email}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{task.assignedTo.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">{task.assignedTo.email}</div>
                </div>

                {task.dueDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 capitalize">
                      {task.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    {task.ageInDays} day{task.ageInDays !== 1 ? 's' : ''} ago
                  </div>
                </div>

                {task.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completed</label>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-900">
                        {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/tasks/${task._id}/edit`}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Edit Task</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Reassign Task</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Cancel Task</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;