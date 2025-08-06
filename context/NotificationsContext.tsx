// Context for notifications (optional, for global state management)
import { useNotifications } from '@/hooks/useNotifications';
import React, { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { unreadCount, refreshUnreadCount, markAsRead } = useNotifications(true);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      refreshUnreadCount,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};