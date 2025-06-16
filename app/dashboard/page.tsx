'use client'
import LogsTable from "@/components/admin/LogsTable";
import PartnersTable from "@/components/admin/PartnersTable";
import StatsGrid from "@/components/admin/StatsGrid";
import SubscribersTable from "@/components/admin/SubscribersTable";
import UsersTable from "@/components/admin/UserTable";
import { Loading } from "@/components/LoadingComponent";
import { useData } from "@/hooks/useData";
import { useLogs } from "@/hooks/useLogs";
import { useSubscribers } from "@/hooks/useSubscribers";
import Link from "next/link";
import React from "react";
// import { Loading } from "./logs/page";

const DashBoardHomepage = () => {
  const { users, loading } = useData();
  const {  totalSubs } = useSubscribers();
  const { logs } = useLogs();

  const mockData = {
    partners: [
      {
        _id: "1",
        companyName: "Naivas Supermarket",
        status: "approved" as const,
        industry: "retail" as const,
        submittedAt: new Date("2024-01-15"),
        contactPerson: "John Doe",
        email: "john@naivas.com",
        phone: "+254700000000",
        businessType: "b2c" as const,
        location: "Nairobi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "2",
        companyName: "Safaricom Ltd",
        status: "pending" as const,
        industry: "other" as const,
        submittedAt: new Date("2024-01-14"),
        contactPerson: "Jane Smith",
        email: "jane@safaricom.com",
        phone: "+254700000001",
        businessType: "b2b" as const,
        location: "Nairobi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    subscribers: [
      {
        _id: "1",
        email: "john@example.com",
        confirmed: true,
        subscribedAt: new Date("2024-01-15"),
        token: "token1",
        isActive: true,
      },
      {
        _id: "2",
        email: "jane@example.com",
        confirmed: false,
        subscribedAt: new Date("2024-01-14"),
        token: "token2",
        isActive: true,
      },
    ],
    stats: {
      totalPartners: 45,
      pendingPartners: 12,
      approvedPartners: 28,
      totalSubscribers: totalSubs,
      confirmedSubscribers: totalSubs,
      monthlyGrowth: 15.2,
      // Add logs stats
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
    },
  };
  return (
    <div className="space-y-6">
      <StatsGrid stats={mockData.stats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Recent Partner Applications
          </h3>
          <PartnersTable partners={mockData.partners.slice(0, 3)} isCompact />
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Subscribers</h3>
          <SubscribersTable  isCompact />
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
        {  loading ? <Loading></Loading> : <UsersTable users={users?.slice(0, 5) || []} isCompact />}
        </div>
      </div>

      {/* Recent Logs Section */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity Logs</h3>
          <Link 
          href={'/dashboard/logs'}
            //   onClick={() => handleTabChange("logs")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Logs
          </Link>
        </div>
        <LogsTable logs={logs?.slice(0, 3) || []} isCompact />
      </div>
    </div>
  );
};

export default DashBoardHomepage;
