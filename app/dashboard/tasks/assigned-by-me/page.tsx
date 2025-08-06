// app/dashboard/tasks/assigned-by-me/page.tsx
"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter,
  Search,
  ChevronDown,
  Calendar,
  User,
  ArrowLeft,
  RotateCcw,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getPlainTextPreview } from '@/lib/utils';

// Types
interface IAssignee {
  userId: string;
  name: string;
  email: string;
  taskCount: number;
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
  comments: any[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isOverdue: boolean;
  ageInDays: number;
}

interface TasksResponse {
  tasks: ITask[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    assignee?: string;
  };
  statusCounts: {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  assignees: IAssignee[];
}

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  
  const icons = {
    pending: Clock,
    in_progress: RotateCcw,
    completed: CheckCircle,
    cancelled: AlertTriangle
  };

  const Icon = icons[status as keyof typeof icons];
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

// Task Card Component
const TaskCard = ({ task }: { task: ITask }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.01 }}
    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
  >
    <Link href={`/dashboard/tasks/${task._id}`}>
      <div className="cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
              {task.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {getPlainTextPreview(task.description)}
            </p>
          </div>
          {task.isOverdue && (
            <AlertTriangle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>To: {task.assignedTo.name}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className={task.isOverdue ? 'text-red-600 font-medium' : ''}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div className="text-xs">
            {task.ageInDays} day{task.ageInDays !== 1 ? 's' : ''} old
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 capitalize">
              {task.category.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {task.comments.length > 0 && (
                <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
              )}
              {task.attachments.length > 0 && (
                <span>{task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// Filter Component
const FilterBar = ({ 
  filters, 
  statusCounts, 
  assignees,
  onFilterChange, 
  onSearchChange 
}: {
  filters: any;
  statusCounts: any;
  assignees: IAssignee[];
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: 'All Tasks', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
          { key: 'completed', label: 'Completed', count: statusCounts.completed },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => onFilterChange('status', item.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              (filters.status === item.key || (!filters.status && item.key === 'all'))
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <select
                value={filters.assignee || 'all'}
                onChange={(e) => onFilterChange('assignee', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assignees</option>
                {assignees.map((assignee) => (
                  <option key={assignee.userId} value={assignee.userId}>
                    {assignee.name} ({assignee.taskCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  onFilterChange('sortBy', sortBy);
                  onFilterChange('sortOrder', sortOrder);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="dueDate_asc">Due Date (Earliest)</option>
                <option value="dueDate_desc">Due Date (Latest)</option>
                <option value="priority_desc">Priority (High to Low)</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component
const AssignedByMePage = () => {
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...filters
      });

      const response = await fetch(`/api/tasks/assigned-by-me?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      setData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tasks</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTasks}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/tasks"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks Assigned by Me</h1>
              <p className="text-gray-600 mt-1">
                Manage tasks you've assigned to others ({data?.pagination.totalTasks || 0} total)
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            New Task
          </Link>
        </motion.div>

        {/* Filters */}
        {data && (
          <FilterBar
            filters={filters}
            statusCounts={data.statusCounts}
            assignees={data.assignees}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />
        )}

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {data?.tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {data?.tasks.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.assignee !== 'all'
                ? 'Try adjusting your filters to see more tasks.'
                : 'You haven\'t assigned any tasks yet.'}
            </p>
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Create Your First Task
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Showing {((data.pagination.currentPage - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalTasks)} of{' '}
              {data.pagination.totalTasks} tasks
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!data.pagination.hasPrevPage}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!data.pagination.hasNextPage}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedByMePage;