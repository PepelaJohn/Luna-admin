// @/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  phone?:string;
  isActive:boolean;
  multifactorAuthentication:boolean
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authApi.me();
      
      if (data.success && data.user) {
        
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Failed to check authentication');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const data = await authApi.login(email, password);
      
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null); // Force logout on client side
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      setError(null);
      const data = await authApi.register(name, email, password, role);
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    avatar?: string;
  }) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      const data = await authApi.changePassword(currentPassword, newPassword);
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Password change failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setError(null);
      const data = await authApi.verifyEmail(token);
      
      if (data.success) {
        // Refresh user data after email verification
        await checkAuth();
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Email verification failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Email verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setError(null);
      const data = await authApi.requestPasswordReset(email);
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Password reset request failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setError(null);
      const data = await authApi.resetPassword(token, password);
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Password reset failed');
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    checkAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}