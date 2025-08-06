// hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  actionUrl?: string;
  timeAgo: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  bulkAction: (action: 'mark_read' | 'archive', ids: string[]) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotifications = (
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      if (append) {
        setNotifications(prev => [...prev, ...data.data.notifications]);
      } else {
        setNotifications(data.data.notifications);
      }
      
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh unread count only
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
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
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
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
  }, [notifications]);

  // Archive single notification
  const archiveNotification = useCallback(async (notificationId: string) => {
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
  }, [notifications]);

  // Bulk actions
  const bulkAction = useCallback(async (action: 'mark_read' | 'archive', notificationIds: string[]) => {
    if (notificationIds.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notificationIds
        })
      });

      if (response.ok) {
        if (action === 'mark_read') {
          setNotifications(prev => 
            prev.map(n => 
              notificationIds.includes(n._id)
                ? { ...n, isRead: true }
                : n
            )
          );
          const unreadSelected = notifications.filter(n => 
            notificationIds.includes(n._id) && !n.isRead
          ).length;
          setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        } else {
          setNotifications(prev => prev.filter(n => !notificationIds.includes(n._id)));
          const unreadSelected = notifications.filter(n => 
            notificationIds.includes(n._id) && !n.isRead
          ).length;
          setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        }
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  }, [notifications]);

  // Auto-refresh unread count
  useEffect(() => {
    if (autoRefresh) {
      refreshUnreadCount();
      
      const interval = setInterval(refreshUnreadCount, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    bulkAction,
    refreshUnreadCount
  };
};

// Hook specifically for the notification bell
export const useNotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshCount();
    
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  return {
    unreadCount,
    lastChecked,
    refreshCount
  };
};



// Utility functions
export const notificationUtils = {
  // Get notification icon color
  getNotificationColor: (type: string): string => {
    const colors = {
      task_assigned: 'text-blue-500',
      task_comment: 'text-green-500',
      task_completed: 'text-green-500',
      task_status_changed: 'text-orange-500',
      task_overdue: 'text-red-500',
      task_due_soon: 'text-yellow-500'
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  },

  // Format notification type for display
  formatNotificationType: (type: string): string => {
    const formatted = {
      task_assigned: 'Task Assigned',
      task_comment: 'New Comment',
      task_completed: 'Task Completed',
      task_status_changed: 'Status Changed',
      task_overdue: 'Overdue Task',
      task_due_soon: 'Due Soon'
    };
    return formatted[type as keyof typeof formatted] || type;
  },

  // Get priority badge classes
  getPriorityClasses: (priority: string): string => {
    const classes = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800', 
      high: 'bg-red-100 text-red-800'
    };
    return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  },

  // Sort notifications by priority and date
  sortNotifications: (notifications: Notification[]): Notification[] => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    
    return [...notifications].sort((a, b) => {
      // First, sort by read status (unread first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      
      // Then by priority
      const aPriority = priorityWeight[a.priority as keyof typeof priorityWeight] || 1;
      const bPriority = priorityWeight[b.priority as keyof typeof priorityWeight] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Finally by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  // Group notifications by date
  groupNotificationsByDate: (notifications: Notification[]): Record<string, Notification[]> => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let key: string;
      
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        key = 'This Week';
      } else {
        key = date.toLocaleDateString();
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(notification);
    });
    
    return groups;
  }
};