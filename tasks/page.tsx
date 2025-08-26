// app/dashboard/tasks/assigned-to-me/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MessageCircle, 
  User, 
  X, 
  Send,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';

// Types
interface User {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface Comment {
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedBy: User;
  assignedTo: User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  category: string;
  attachments: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isOverdue?: boolean;
  ageInDays?: number;
}

// TaskCard Component
const TaskCard: React.FC<{ 
  task: Task; 
  onTaskClick: (task: Task) => void;
  className?: string;
}> = ({ task, onTaskClick, className = "" }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-900 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-900 border-orange-200';
      case 'medium': return 'bg-yelow-100 text-yelow-900 border-yelow-200';
      case 'low': return 'bg-green-100 text-green-900 border-green-200';
      default: return 'bg-gray-100 text-gray-900 border-gray-200';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-900 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yelow-900 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-900 border-gray-200';
      default: return 'bg-gray-100 text-gray-900 border-gray-200';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && 
    !['completed', 'cancelled'].includes(task.status);

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div 
      className={`group bg-white border rounded-lg p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer ${
        isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
      } ${className}`}
      onClick={() => onTaskClick(task)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-black">
          {task.title}
        </h3>
        <div className="flex flex-col space-y-1 ml-4 flex-shrink-0">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border text-center ${getPriorityStyles(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border text-center ${getStatusStyles(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>
      
      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>By {task.assignedBy.name}</span>
          </div>
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${
            isOverdue ? 'text-red-700 font-medium' : 'text-gray-500'
          }`}>
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}
      </div>
      
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <span className="text-xs text-red-700 font-medium">⚠️ This task is overdue</span>
        </div>
      )}
    </div>
  );
};

// TaskDetailModal Component
const TaskDetailModal: React.FC<{
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}> = ({ task, isOpen, onClose, onTaskUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>(task.comments || []);
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(task.status);

  const updateTaskStatus = async (newStatus: "pending" | "in_progress" | "completed" | "cancelled") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const data = await response.json();
        onTaskUpdate(data);
        setSelectedStatus(newStatus);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newComment })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data]);
        setNewComment('');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Assigned by: <strong>{task.assignedBy.name}</strong></span>
                <span>Category: <strong>{task.category.replace('_', ' ')}</strong></span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => updateTaskStatus(e.target.value as unknown as "pending" | "in_progress" | "completed" | "cancelled")}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yelow-500 focus:border-yelow-500 disabled:bg-gray-100"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <input
                type="text"
                value={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            {task.dueDate && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="text"
                    value={new Date(task.dueDate).toLocaleDateString()}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <input
                    type="text"
                    value={new Date(task.createdAt).toLocaleDateString()}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>
            
            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yelow-500 focus:border-yelow-500"
                onKeyPress={(e) => e.key === 'Enter' && !loading && addComment()}
                disabled={loading}
              />
              <button
                onClick={addComment}
                disabled={loading || !newComment.trim()}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const AssignedTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch tasks function
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/tasks/assigned-to-me?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
        setPagination(data.pagination);
        setStatusCounts(data.statusCounts);
      } else {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle task updates
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
    // Refresh counts
    fetchTasks();
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Effect for fetching tasks
  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.currentPage]);

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Tasks', count: statusCounts.all },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
    { value: 'completed', label: 'Completed', count: statusCounts.completed },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
  ];

  return (
    <div className="min-h-screen  md:pt-[100px] pt-[80px] bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks Assigned to Me</h1>
          <p className="text-gray-600 mt-2">Manage your assigned tasks and track progress</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 border border-gray-200">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('status', option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.status === option.value
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-300 rounded-lg !outline-none  focus:border-2"
              />
            </div>
            
            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg  text-gray-700 !outline-none  focus:border-2"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg !outline-none  focus:border-2"
            >
              <option value="all">All Categories</option>
              <option value="user_management">User Management</option>
              <option value="system_config">System Config</option>
              <option value="content_review">Content Review</option>
              <option value="security_audit">Security Audit</option>
              <option value="data_analysis">Data Analysis</option>
              <option value="maintenance">Maintenance</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="h-4 w-4" />
              <span className="text-sm">
                {pagination.totalTasks} task{pagination.totalTasks !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'You have no assigned tasks at the moment.'}
              </p>
              {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all') && (
                <button
                  onClick={() => {
                    setFilters({ status: 'all', priority: 'all', category: 'all', search: '' });
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {tasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pagination.currentPage === page
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && <span className="text-gray-500">...</span>}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(AssignedTasksPage, ['moderator']);