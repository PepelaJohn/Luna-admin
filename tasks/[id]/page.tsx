// app/dashboard/tasks/[id]/page.tsx - Simplified version using custom hook
'use client';
import './module.css'
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Send,
  Edit3,
  Save,
  X,
  Paperclip,
  Shield,
  PlayCircle,
  // PauseCircle,
  XCircle
} from 'lucide-react';
// import API from '@/config/apiclient';
import { usePopup } from '@/context/PopupContext';
import { useAuth } from '@/context/AuthContext';
import { useTask } from '@/hooks/useTasks';

// Custom hook for task management

  
// Status configuration
const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'Pending'
  },
  in_progress: {
    icon: PlayCircle,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'In Progress'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Completed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    label: 'Cancelled'
  }
};

const priorityConfig = {
  low: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Low Priority'
  },
  medium: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'Medium Priority'
  },
  high: {
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'High Priority'
  },
  urgent: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Urgent'
  }
};

// Main component
const TaskViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { task, comments, loading, error, refresh, updateTaskStatus, addComment } = useTask(taskId);
  
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const {showError} = usePopup()
  // Mock current user - replace with actual auth
  const {user:currentUser} = useAuth()

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    } else {
      showError('Failed to add comment');
    }
    setCommentLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === task?.status) {
      setIsEditingStatus(false);
      return;
    }

    setStatusLoading(true);
    const success = await updateTaskStatus(selectedStatus);
    if (!success) {
      showError('Failed to update status');
    }
    setIsEditingStatus(false);
    setStatusLoading(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && 
    !['completed', 'cancelled'].includes(task.status);

  React.useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
    }
  }, [task]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Task not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The task you&apos;re looking for might have been removed or you don&apos;t have access to it.
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
            <button
              onClick={refresh}
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:pt-[100px] pt-[60px] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-black mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to tasks</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Task Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned by <strong className="text-gray-900">{task.assignedBy.name}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Assigned to <strong className="text-gray-900">{task.assignedTo.name}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span className="capitalize">{task.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-row lg:flex-col gap-3 mt-4 lg:mt-0 lg:ml-8">
                  <div className={`px-4 py-2 rounded-xl border text-sm font-semibold text-center ${
                    statusConfig[task.status as unknown as keyof typeof statusConfig].color
                  } ${statusConfig[task.status as unknown as keyof typeof statusConfig].bgColor} ${statusConfig[task.status as unknown as keyof typeof statusConfig].borderColor}`}>
                    {statusConfig[task.status as unknown as keyof typeof statusConfig].label}
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-sm font-semibold text-center ${
                    priorityConfig[task.priority as keyof typeof priorityConfig].color
                  } ${priorityConfig[task.priority as keyof typeof priorityConfig].bgColor} ${priorityConfig[task.priority as keyof typeof priorityConfig].borderColor}`}>
                    {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                  </div>
                </div>
              </div>

              {/* Overdue Warning */}
              {isOverdue && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700 font-medium">This task is overdue!</p>
                  </div>
                </div>
              )}

              {/* Task Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Created</span>
                    <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {task.dueDate && (
                  <div className={`flex items-center space-x-3 text-sm ${
                    isOverdue ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Due Date</span>
                      <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center space-x-3 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Completed</span>
                      <span className="font-medium">{new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task Description */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
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
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                  <MessageCircle className="h-6 w-6" />
                  <span>Comments</span>
                  <span className="text-lg font-normal text-gray-500">({comments.length})</span>
                </h2>
              </div>

              {/* Comments List */}
              <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No comments yet</p>
                    <p className="text-gray-400 text-sm">Be the first to add a comment!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => {
                    const isOwnComment = comment.userId === currentUser?._id;
                    return (
                      <div key={index} className={`flex  ${isOwnComment ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] w-fit ${
                          isOwnComment 
                            ? 'bg-blue-100 rounded-r-xl rounded-tl-xl border-blue-200' 
                            : 'bg-gray-50 rounded-l-xl rounded-tr-xl border-gray-200'
                        } border  p-4`}>
                          <div className="flex items-center gap-2 justify-between mb-2">
                            <span className="font-semibold capitalize text-gray-900 text-xs">
                              {isOwnComment ? "You":comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {comment.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={4}
                    className="w-full p-4 border text-gray-800 border-gray-300 rounded-lg  resize-none text-sm"
                    disabled={commentLoading}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={commentLoading || !newComment.trim()}
                      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 cursor-not-allowed disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4 " />
                      <span>{commentLoading ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            
            {/* Status Update */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Edit3 className="h-5 w-5" />
                <span>Update Status</span>
              </h3>

              {!isEditingStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {React.createElement(statusConfig[task.status as keyof typeof statusConfig].icon, {
                      className: `h-5 w-5 ${statusConfig[task.status as keyof typeof statusConfig].color}`
                    })}
                    <span className="font-medium text-gray-900">
                      {statusConfig[task.status as keyof typeof statusConfig].label}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Change Status
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={statusLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={statusLoading}
                      className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{statusLoading ? 'Updating...' : 'Update'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus(task.status);
                        setIsEditingStatus(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 text-black" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Task Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Task Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Assigned By
                  </label>
                  <div className="text-sm text-gray-900 font-medium">{task.assignedBy.name}</div>
                  <div className="text-xs text-gray-500">{task.assignedBy.email}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Assigned To
                  </label>
                  <div className="text-sm text-gray-900 font-medium">{task.assignedTo.name}</div>
                  <div className="text-xs text-gray-500">{task.assignedTo.email}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <div className="text-sm text-gray-900 capitalize">
                    {task.category.replace('_', ' ')}
                  </div>
                </div>

                {task.attachments.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Attachments ({task.attachments.length})
                    </label>
                    <div className="space-y-2">
                      {task.attachments.map((attachment: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskViewPage;