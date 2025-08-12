// @/context/AuthContext.ts (Updated with proper pagination support)
import { useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { Pagination, User } from '@/lib/types';

// Define the filters interface
interface UserFilters {
  search?: string;
  role?: string;
  isActive?: string;
  isEmailVerified?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseDataParams {
  page?: number;
  limit?: number;
  filters?: UserFilters;
  autoFetch?: boolean; // Whether to fetch immediately on mount
}

export function useData({
  page = 1,
  limit = 10,
  filters = {},
  autoFetch = true
}: UseDataParams = {}) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of current parameters for refetching
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit, setCurrentLimit] = useState(limit);
  const [currentFilters, setCurrentFilters] = useState<UserFilters>(filters);

  // Updated getUsers function with parameters
  const getUsers = useCallback(async (
    targetPage = currentPage,
    targetLimit = currentLimit,
    targetFilters = currentFilters
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams: any = {
        page: targetPage,
        limit: targetLimit,
        ...targetFilters
      };
      
      // Remove undefined/empty values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === 'all') {
          delete queryParams[key];
        }
      });

      const data = await usersApi.getUsers(queryParams);
      
      setUsers(data.users);
      setPagination(data.pagination);
      
      // Update current state
      setCurrentPage(targetPage);
      setCurrentLimit(targetLimit);
      setCurrentFilters(targetFilters);
      
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMessage);
      setUsers(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentFilters]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      getUsers(page, limit, filters);
    }
  }, []); // Only run on mount

  // Function to update page
  const setPage = useCallback((newPage: number) => {
    getUsers(newPage, currentLimit, currentFilters);
  }, [getUsers, currentLimit, currentFilters]);

  // Function to update filters
  const setFilters = useCallback((newFilters: UserFilters) => {
    // Reset to page 1 when filters change
    getUsers(1, currentLimit, newFilters);
  }, [ currentLimit]);

  // Function to update limit
  const setLimit = useCallback((newLimit: number) => {
    // Reset to page 1 when limit changes
    getUsers(1, newLimit, currentFilters);
  }, [getUsers, currentFilters]);

  // Refresh current data
  const refresh = useCallback(() => {
    getUsers(currentPage, currentLimit, currentFilters);
  }, [getUsers, currentPage, currentLimit, currentFilters]);

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    avatar?: string;
  }) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(data);
      
      if (response.success && response.user) {
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

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      const data = await usersApi.deleteUser(id);
      
      if (data.success) {
        // Remove user from current list
        const updatedUsers = users?.filter((user) => user._id !== id) || [];
        setUsers(updatedUsers);
        
        // Update pagination count
        if (pagination) {
          const newTotal = pagination.total - 1;
          const newPages = Math.ceil(newTotal / pagination.limit);
          
          setPagination({
            ...pagination,
            total: newTotal,
            pages: newPages,
            hasNext: currentPage < newPages,
            hasPrev: currentPage > 1
          });
          
          // If current page is now empty and not the first page, go to previous page
          if (updatedUsers.length === 0 && currentPage > 1) {
            setPage(currentPage - 1);
            return { success: true, message: (data as any).message };
          }
        }
        
        return { success: true, message: (data as any).message };
      }
      
      return { success: false, error: (data as any).message };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || "Failed to delete user";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updateData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await usersApi.updateUser({ id, updateUserData: updateData });
      
      if (response.success) {
        // Update user in current list
        const updatedUsers = users?.map(user => 
          user._id === id ? { ...user, ...updateData } : user
        ) || [];
        setUsers(updatedUsers);
        
        return { success: true, message: response.message };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || "Failed to update user";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    users,
    pagination,
    loading,
    error,
    
    // Current state
    currentPage,
    currentLimit,
    currentFilters,
    
    // Actions
    getUsers,
    setPage,
    setFilters,
    setLimit,
    refresh,
    deleteUser,
    updateUser,
    updateProfile,
  };
}