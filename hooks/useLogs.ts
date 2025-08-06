// @/hooks/useLogs.ts 
import { useState, useEffect, useCallback, useRef } from 'react';
import { logsApi } from '@/lib/api';
import { LogResponse } from '@/lib/types';
import { Pagination } from '@/components/admin/LogsTable';

interface FilterParams {
  searchTerm?: string;
  filterSeverity?: string;
  filterAction?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface LogsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  filterSeverity?: string;
  filterAction?: string;
  dateFrom?: string;
  dateTo?: string;
  role?: 'normal' | 'corporate' | 'admin' | 'super_admin';
}

export function useLogs(initialParams?: LogsParams) {
  const [logs, setLogs] = useState<LogResponse[] | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current filters and pagination state
  const [currentParams, setCurrentParams] = useState<LogsParams>({
    page: 1,
    limit: 20,
    searchTerm: '',
    filterSeverity: 'all',
    filterAction: 'all',
    dateFrom: '',
    dateTo: '',
    ...initialParams
  });

  // Use ref to track if initial load has happened
  const hasInitiallyLoaded = useRef(false);

  // Remove currentParams from dependency array and use the params argument instead
  const getUserLogs = useCallback(async (params: LogsParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters, excluding 'all' values and empty strings
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        limit: params.limit || 20,
      };
      
      if (params.searchTerm && params.searchTerm.trim()) {
        queryParams.search = params.searchTerm.trim();
      }
      
      if (params.filterSeverity && params.filterSeverity !== 'all') {
        queryParams.severity = params.filterSeverity;
      }
      
      if (params.filterAction && params.filterAction !== 'all') {
        queryParams.action = params.filterAction;
      }
      
      if (params.dateFrom) {
        queryParams.dateFrom = params.dateFrom;
      }
      
      if (params.dateTo) {
        queryParams.dateTo = params.dateTo;
      }
      
      if (params.role) {
        queryParams.role = params.role;
      }

      const data = await logsApi.getLogs(queryParams);
      
      setLogs(data?.logs || []);
      setPagination(data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      });
      
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we're using params argument

  // Update filters and fetch new data
  const updateFilters = useCallback((filters: FilterParams) => {
    const newParams = {
      ...currentParams,
      ...filters,
      page: 1 // Reset to first page when filters change
    };
    
    setCurrentParams(newParams);
    getUserLogs(newParams);
  }, [getUserLogs]); // Only depend on getUserLogs, which is now stable

  // Change page
  const changePage = useCallback((page: number) => {
    setCurrentParams(prevParams => {
      const newParams = {
        ...prevParams,
        page: Math.max(1, Math.min(page, pagination.pages))
      };
      getUserLogs(newParams);
      return newParams;
    });
  }, [getUserLogs, pagination.pages]);

  // Change page size
  const changePageSize = useCallback((limit: number) => {
    setCurrentParams(prevParams => {
      const newParams = {
        ...prevParams,
        limit,
        page: 1 // Reset to first page when page size changes
      };
      getUserLogs(newParams);
      return newParams;
    });
  }, [getUserLogs]);

  // Refetch current data (for retry functionality)
  const refetch = useCallback(() => {
    getUserLogs(currentParams);
  }, [getUserLogs, currentParams]);

  // Initial load - only run once on mount
  useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      getUserLogs(currentParams);
    }
  }, [getUserLogs, currentParams]);

  return {
    logs,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    changePage,
    changePageSize,
    currentParams // Export current params if needed for debugging
  };
}