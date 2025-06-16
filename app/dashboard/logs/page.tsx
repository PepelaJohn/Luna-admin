"use client";
import LogsTable from "@/components/admin/LogsTable";
import UsersTable from "@/components/admin/UserTable";
import { useData } from "@/hooks/useData";
import { useLogs } from "@/hooks/useLogs";
import React from "react";

const Subs = () => {
  const {  pagination, } = useData();
  const { logs, loading } = useLogs();

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200">
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
     {loading ?<Loading></Loading> : <LogsTable
        logs={logs || []}
        pagination={pagination}
        onPageChange={(page: number) => {
          // Implement logs pagination if needed
          // getLogs(page);
        }}
      />}
    </div>
  );
};

export default Subs;

function Loading() {
  return (
    <div className=" py-18 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading ...</p>
      </div>
    </div>
  );
}
