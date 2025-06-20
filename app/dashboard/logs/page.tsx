// app/dashboard/logs/page.tsx
"use client";
import React, { useCallback } from "react";
import LogsTable from "@/components/admin/LogsTable";
import { useLogs } from "@/hooks/useLogs";

interface FilterParams {
  searchTerm?: string;
  filterSeverity?: string;
  filterAction?: string;
  dateFrom?: string;
  dateTo?: string;
}

const LogsPage = () => {
  const { 
    logs, 
    loading, 
    pagination, 
    error,
    refetch,
    updateFilters,
    changePage,
    changePageSize
  } = useLogs();

  const stats = {
    totalLogs: pagination?.total || 0,
    criticalLogs: logs?.filter((log) => log.severity === "critical").length || 0,
    recentLogs: logs?.filter((log) => {
      const logDate = new Date(log.createdAt);
      const today = new Date();
      const daysDiff = (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    }).length || 0,
  };

  const handleFiltersChange = useCallback((filters: FilterParams) => {
    updateFilters(filters);
  }, [updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    changePage(page);
  }, [changePage]);

  const handlePageSizeChange = useCallback((limit: number) => {
    changePageSize(limit);
  }, [changePageSize]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
         <div className="p-4 lg:p-6 bg-white rounded-xl shadow-sm mb-5  border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Activity Logs</h3>
            <p className="text-sm text-gray-600 mt-1">
              System activity and audit trail
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical: {stats.criticalLogs}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Total: {stats.totalLogs}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>This Week: {stats.recentLogs}</span>
            </div>
          </div>
        </div>
      </div>

        {/* Main Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <LogsTable
            logs={logs || []}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onFiltersChange={handleFiltersChange}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  );
};

export default LogsPage;