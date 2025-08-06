// app/dashboard/notifications/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Archive, 
  Filter, 
  RefreshCw,
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Types
interface Notification {
  _id: string;
  type: 'task_assigned' | 'task_completed' | 'task_status_changed' | 'task_comment' | 'task_overdue' | 'task_due_soon';
  title: string;
  message: string;
  recipient: {
    userId: string;
    name: string;
    email: string;
  };
  actor?: {
    userId: string;
    name: string;
    email: string;
  };
  task?: {
    taskId: string;
    title: string;
  };
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  actionUrl?: string;
  timeAgo: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Notification icons
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'task_assigned':
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    case 'task_comment':
      return <MessageCircle className="w-5 h-5 text-green-500" />;
    case 'task_completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'task_status_changed':
      return <Clock className="w-5 h-5 text-orange-500" />;
    case 'task_overdue':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'task_due_soon':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

// Individual notification item
const NotificationCard = ({ 
  notification, 
  onMarkRead, 
  onArchive,
  selected,
  onSelect 
}: { 
  notification: Notification;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}) => {
  const handleAction = (action: 'read' | 'archive', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'read') {
      onMarkRead(notification._id);
    } else {
      onArchive(notification._id);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-6 bg-white rounded-lg border hover:shadow-md transition-all ${
        !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h3>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
                {notification.priority === 'high' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                    High Priority
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{notification.timeAgo}</span>
                {notification.actor && (
                  <span>by {notification.actor.name}</span>
                )}
                <span className="capitalize">{notification.type.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(notification._id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                  <button
                    onClick={(e) => handleAction('read', e)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleAction('archive', e)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={() => !notification.isRead && onMarkRead(notification._id)}>
        {content}
      </Link>
    );
  }

  return content;
};

// Filter component
const FilterBar = ({ 
  filters, 
  onFilterChange 
}: {
  filters: any;
  onFilterChange: (key: string, value: string) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <button
          onClick={() => {
            onFilterChange('type', '');
            onFilterChange('includeRead', 'true');
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="task_assigned">Task Assigned</option>
            <option value="task_comment">Comments</option>
            <option value="task_status_changed">Status Changes</option>
            <option value="task_completed">Completed Tasks</option>
            <option value="task_overdue">Overdue Tasks</option>
            <option value="task_due_soon">Due Soon</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.includeRead}
            onChange={(e) => onFilterChange('includeRead', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="true">All Notifications</option>
            <option value="false">Unread Only</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Archive</label>
          <select
            value={filters.includeArchived}
            onChange={(e) => onFilterChange('includeArchived', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="false">Active Only</option>
            <option value="true">Include Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main notifications page
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    includeRead: 'true',
    includeArchived: 'false'
  });

  // Fetch notifications
  const fetchNotifications = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await fetch(`/api/notifications?${params}`);
      
      if (response.ok) {
        const data:NotificationResponse = await response.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
        setSelectedNotifications(new Set());
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          notificationIds: [notificationId]
        })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId 
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          notificationIds: [notificationId]
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // If it was unread, decrease count
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'mark_read' | 'archive') => {
    if (selectedNotifications.size === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notificationIds: Array.from(selectedNotifications)
        })
      });

      if (response.ok) {
        if (action === 'mark_read') {
          setNotifications(prev => 
            prev.map(n => 
              selectedNotifications.has(n._id)
                ? { ...n, isRead: true }
                : n
            )
          );
          const unreadSelected = notifications.filter(n => 
            selectedNotifications.has(n._id) && !n.isRead
          ).length;
          setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        } else {
          setNotifications(prev => prev.filter(n => !selectedNotifications.has(n._id)));
          const unreadSelected = notifications.filter(n => 
            selectedNotifications.has(n._id) && !n.isRead
          ).length;
          setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        }
        setSelectedNotifications(new Set());
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Handle individual selection
  const handleSelect = (id: string, selected: boolean) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-lg rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                {pagination.totalNotifications} total notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications(pagination.currentPage)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('mark_read')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Archive
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Select All */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedNotifications.size === notifications.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Select all notifications on this page
            </span>
          </div>
        )}

        {/* Notifications List */}
        {error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Notifications</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchNotifications()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filters.includeRead === 'false' 
                ? 'You have no unread notifications' 
                : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {notifications.map(notification => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onArchive={archiveNotification}
                  selected={selectedNotifications.has(notification._id)}
                  onSelect={handleSelect}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalNotifications)} of{' '}
              {pagination.totalNotifications} notifications
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
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

export default NotificationsPage;