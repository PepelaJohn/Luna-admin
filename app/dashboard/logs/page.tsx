"use client";
import LogsTable from "@/components/admin/LogsTable";
import UsersTable from "@/components/admin/UserTable";
import { useData } from "@/hooks/useData";
import { useLogs } from "@/hooks/useLogs";
import React from "react";

const Subs = () => {
  const { users, pagination } = useData();
  const { logs } = useLogs();

  const stats = {
   
   
    totalLogs: logs?.length || 0,
    criticalLogs:
      logs?.filter((log) => log.severity === "critical").length || 0,
    recentLogs:
      logs?.filter((log) => {
        const logDate = new Date(log.createdAt);
        const today = new Date();
        const daysDiff =
          (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      }).length || 0,
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 lg:p-6 border-b">
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
      <LogsTable
        logs={logs || []}
        pagination={pagination}
        onPageChange={(page: number) => {
          // Implement logs pagination if needed
          // getLogs(page);
        }}
      />
    </div>
  );
};

export default Subs;
