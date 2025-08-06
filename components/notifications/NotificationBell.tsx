// components/notifications/NotificationBell.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Archive, X, MessageCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
  };
}

// Notification icons
const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'task_assigned':
      return <CheckCircle {...iconProps} className="w-4 h-4 text-blue-500" />;
    case 'task_comment':
      return <MessageCircle {...iconProps} className="w-4 h-4 text-green-500" />;
    case 'task_completed':
      return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
    case 'task_status_changed':
      return <Clock {...iconProps} className="w-4 h-4 text-orange-500" />;
    case 'task_overdue':
      return <AlertTriangle {...iconProps} className="w-4 h-4 text-red-500" />;
    case 'task_due_soon':
      return <Clock {...iconProps} className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell {...iconProps} className="w-4 h-4 text-gray-500" />;
  }
};

// Individual notification item
const NotificationItem = ({ 
  notification, 
  onMarkRead, 
  onArchive 
}: { 
  notification: Notification;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {notification.timeAgo}
                </span>
                {notification.priority === 'high' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                    High Priority
                  </span>
                )}
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button
                  onClick={(e) => handleAction('read', e)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => handleAction('archive', e)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Archive"
              >
                <Archive className="w-3 h-3" />
              </button>
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

// Main notification bell component
const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        // console.log(data)
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=10`);
      
      if (response.ok) {
        const data: NotificationResponse = await response.json();
         
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasNextPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [isOpen]);

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

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    
    if (unreadIds.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          notificationIds: unreadIds
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative   p-2 rounded-lg mr-3 transition-colors bg-slate-700/50 group-hover:bg-slate-600/50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 "
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({unreadCount} unread)
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onArchive={archiveNotification}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {/* Load more button */}
                  {hasMore && (
                    <div className="p-4 text-center border-t border-gray-100">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link
                  href="/dashboard/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;