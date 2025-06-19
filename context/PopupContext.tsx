'use client'
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Types
export type PopupType = 'success' | 'error' | 'warning' | 'info';

export interface Popup {
  id: number;
  message: string;
  type: PopupType;
  duration: number;
  isExiting: boolean;
}

export interface PopupContextType {
  popups: Popup[];
  showPopup: (message: string, type?: PopupType, duration?: number) => number;
  showSuccess: (message: string, duration?: number) => number;
  showError: (message: string, duration?: number) => number;
  showWarning: (message: string, duration?: number) => number;
  showInfo: (message: string, duration?: number) => number;
  removePopup: (id: number) => void;
  clearAll: () => void;
}

export interface PopupProviderProps {
  children: ReactNode;
}

export interface PopupMessageProps {
  popup: Popup;
  onClose: () => void;
}

// Create the context
const PopupContext = createContext<PopupContextType | undefined>(undefined);

// Custom hook to use the popup context
export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

// Popup Provider Component
export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popups, setPopups] = useState<Popup[]>([]);

  // Function to add a new popup
  const showPopup = useCallback((message: string, type: PopupType = 'info', duration: number = 4000): number => {
    const id = Date.now() + Math.random();
    const popup: Popup = {
      id,
      message,
      type,
      duration,
      isExiting: false
    };

    setPopups(prev => [...prev, popup]);

    // Auto-remove popup after duration
    if (duration > 0) {
      setTimeout(() => {
        removePopup(id);
      }, duration);
    }

    return id;
  }, []);

  // Function to remove a specific popup with animation
  const removePopup = useCallback((id: number): void => {
    // First trigger exit animation, then remove from state
    setPopups(prev => prev.map(popup => 
      popup.id === id ? { ...popup, isExiting: true } : popup
    ));
    
    // Remove after animation completes
    setTimeout(() => {
      setPopups(prev => prev.filter(popup => popup.id !== id));
    }, 300);
  }, []);

  // Convenience functions for different types
  const showSuccess = useCallback((message: string, duration?: number): number => {
    return showPopup(message, 'success', duration);
  }, [showPopup]);

  const showError = useCallback((message: string, duration?: number): number => {
    return showPopup(message, 'error', duration);
  }, [showPopup]);

  const showWarning = useCallback((message: string, duration?: number): number => {
    return showPopup(message, 'warning', duration);
  }, [showPopup]);

  const showInfo = useCallback((message: string, duration?: number): number => {
    return showPopup(message, 'info', duration);
  }, [showPopup]);

  // Clear all popups
  const clearAll = useCallback((): void => {
    setPopups([]);
  }, []);

  const value: PopupContextType = {
    popups,
    showPopup,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removePopup,
    clearAll
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <PopupContainer />
    </PopupContext.Provider>
  );
};

// Popup Container Component - renders all popups
const PopupContainer: React.FC = () => {
  const { popups, removePopup } = usePopup();

  if (popups.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {popups.map(popup => (
        <PopupMessage
          key={popup.id}
          popup={popup}
          onClose={() => removePopup(popup.id)}
        />
      ))}
    </div>
  );
};

// Individual Popup Message Component
const PopupMessage: React.FC<PopupMessageProps> = ({ popup, onClose }) => {
  const { message, type, isExiting } = popup;
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (): void => {
    onClose();
  };

  const getTypeStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'info':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getIcon = (): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-between
        min-w-80 max-w-md p-4
        rounded-lg border-l-4 shadow-lg
        transform transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      style={{
        transform: isVisible && !isExiting 
          ? 'translateX(0) scale(1)' 
          : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg font-bold">
          {getIcon()}
        </span>
        <p className="text-sm font-medium">
          {message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-white hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default PopupProvider;