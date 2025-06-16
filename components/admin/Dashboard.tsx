"use client";
// import image from './profile.png'
import React, { useState, useEffect, useRef } from "react";

import Sidebar from "./SideBar";
import StatsGrid from "./StatsGrid";
import PartnersTable from "./PartnersTable";
import SubscribersTable from "./SubscribersTable";
import LogsTable from "./LogsTable"; // Import the new LogsTable component
import {
  Menu,
  X,
  Settings,
  Search,
  SunDim,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserIcon,
} from "lucide-react";
// import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthenticationRequired from "./AuthRequired";
import { useData } from "@/hooks/useData";
import UsersTable from "./UserTable";
import { useLogs } from "@/hooks/useLogs";
import { useSubscribers } from "@/hooks/useSubscribers";
// import { User } from "@/lib/types";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "normal" | "corporate" | "admin";
  isEmailVerified: boolean;
  avatar?: string;
  sessionVersion: number;
  passwordChangedAt: string | null;
  lastLogin: Date | undefined;
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string;
}

// Add LogResponse interface for logs

const Dashboard: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { logs } = useLogs();
  const { subscribers, totalSubs } = useSubscribers();
  const { users, pagination, getUsers } = useData();

  const router = useRouter();
  const [popupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  //  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
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

  useEffect(() => {
   
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url);
    }
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <AuthenticationRequired></AuthenticationRequired>;
  }

  const notifications = [
    {
      from: {
        name: "Joshua Kiumbe",
        _id: "jaldfjakldjf12jlk",
        email: "joshua@gmail.com",
      },
      to: {
        name: "Isaac Mosii",
        _id: "jaldfjasfkldjf12jlk",
        email: "isaac@gmail.com",
      },
      message: "Please allocate admin status to user id 123kkj13123",
      createdAt: new Date(),
    },
    {
      from: {
        name: "Peter Katani",
        _id: "jaldfjakldjf12jlk",
        email: "Peter@gmail.com",
      },
      to: {
        name: "Joseph Kinara",
        _id: "jaldfjasfkldjf12jlk",
        email: "Joseph@gmail.com",
      },
      message: "Please Revoke admin session for userId 12323232",
      createdAt: new Date(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          LUNA ADMIN
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
         setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 min-h-screen lg:ml-0">
          {/* Header */}
          <div className="hidden lg:flex items-center justify-between p-6 bg-gray-100 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "overview" ? "Dashboard Overview" : activeTab}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "overview" &&
                  "Welcome back! Here's what's happening."}
                {activeTab === "partners" &&
                  "Manage your business partnerships"}
                {activeTab === "subscribers" && "Track your email subscribers"}
                {activeTab === "users" && "User management system"}
                {activeTab === "logs" && "System activity and audit logs"}
                {activeTab === "settings" && "System configuration"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Search */}
              <div
                className={`flex items-center transition-all duration-300 ${
                  isSearchBarOpen
                    ? "bg-white  rounded-full px-3 py-2 shadow-sm"
                    : ""
                }`}
              >
                <input
                  className={`transition-all duration-300 bg-transparent border-none outline-none ${
                    isSearchBarOpen ? "w-64" : "w-0"
                  }`}
                  type="text"
                  placeholder="Search..."
                />
                <button
                  onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Notifications */}
              <div className="relative" ref={popupRef}>
                <button
                  onClick={() => setIsPopupOpen(!popupOpen)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {popupOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {notification.from.name}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {notification.createdAt.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {notification.from.email}
                              </p>
                              <p className="text-sm text-gray-700">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className=" relative px-8 py-14">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <StatsGrid stats={mockData.stats} />

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Partner Applications
                    </h3>
                    <PartnersTable
                      partners={mockData.partners.slice(0, 3)}
                      isCompact
                    />
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Subscribers
                    </h3>
                    <SubscribersTable
                      
                      isCompact={true}
                    />
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                    <UsersTable users={users?.slice(0, 5) || []} isCompact />
                  </div>
                </div>

                {/* Recent Logs Section */}
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Recent Activity Logs
                    </h3>
                    <button
                      
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Logs
                    </button>
                  </div>
                  <LogsTable logs={logs?.slice(0, 5) || []} isCompact />
                </div>
              </div>
            )}

            {activeTab === "partners" && (
              Patners(mockData)
            )}

            {activeTab === "subscribers" && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 lg:p-6 border-b">
                  <h3 className="text-lg font-semibold">Email Subscribers</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your newsletter subscribers
                  </p>
                </div>
                <SubscribersTable  />
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 lg:p-6 border-b">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage users, roles, and permissions
                  </p>
                </div>
                <UsersTable
                  users={users || []}
                  pagination={pagination}
                  onPageChange={(page: number) => {
                    // Call your getUsers function with the new page
                    // getUsers();
                  }}
                  onUserUpdate={async (userId, updates) => {
                    // Implement user update logic here
                    try {
                      // Make API call to update user
                      // await updateUser(userId, updates);

                      // Refresh the users list
                      // getUsers();

                      // Show success message
                    } catch (error) {
                      console.error("Failed to update user:", error);
                      // Show error message
                    }
                  }}
                />
              </div>
            )}

            {activeTab === "logs" && (
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
                        <span>Critical: {mockData.stats.criticalLogs}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Total: {mockData.stats.totalLogs}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>This Week: {mockData.stats.recentLogs}</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
function Patners(mockData: {
  partners: ({ _id: string; companyName: string; status: "approved"; industry: "retail"; submittedAt: Date; contactPerson: string; email: string; phone: string; businessType: "b2c"; location: string; createdAt: Date; updatedAt: Date; } | { _id: string; companyName: string; status: "pending"; industry: "other"; submittedAt: Date; contactPerson: string; email: string; phone: string; businessType: "b2b"; location: string; createdAt: Date; updatedAt: Date; })[]; subscribers: { _id: string; email: string; confirmed: boolean; subscribedAt: Date; token: string; isActive: boolean; }[]; stats: {
    totalPartners: number; pendingPartners: number; approvedPartners: number; totalSubscribers: number; confirmedSubscribers: number; monthlyGrowth: number;
    // Add logs stats
    totalLogs: number; criticalLogs: number; recentLogs: number;
  };
}): React.ReactNode {
  return <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="p-4 lg:p-6 border-b">
      <h3 className="text-lg font-semibold">
        Partner Applications
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Manage and review partnership requests
      </p>
    </div>
    <PartnersTable partners={mockData.partners} />
  </div>;
}

