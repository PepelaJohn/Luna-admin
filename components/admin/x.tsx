"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Settings, Search, Sun, Moon, Bell, User, ChevronDown, BarChart3, Users, UserCheck, Calendar, TrendingUp, Eye, Mail, Building2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Mock auth context
const useAuth = () => ({ isAuthenticated: true });

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [popupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
        industry: "telecommunications" as const,
        submittedAt: new Date("2024-01-14"),
        contactPerson: "Jane Smith",
        email: "jane@safaricom.com",
        phone: "+254700000001",
        businessType: "b2b" as const,
        location: "Nairobi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "3",
        companyName: "Equity Bank",
        status: "rejected" as const,
        industry: "finance" as const,
        submittedAt: new Date("2024-01-13"),
        contactPerson: "Mike Johnson",
        email: "mike@equity.com",
        phone: "+254700000002",
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
      {
        _id: "3",
        email: "mike@example.com",
        confirmed: true,
        subscribedAt: new Date("2024-01-12"),
        token: "token3",
        isActive: false,
      },
    ],
    stats: {
      totalPartners: 45,
      pendingPartners: 12,
      approvedPartners: 28,
      totalSubscribers: 1250,
      confirmedSubscribers: 980,
      monthlyGrowth: 15.2,
    },
  };

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

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "partners", label: "Partners", icon: Building2 },
    { id: "subscribers", label: "Subscribers", icon: Mail },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url);
    }
    setIsSidebarOpen(false);
  };

  const StatsGrid = ({ stats }: { stats: any }) => {
    const statCards = [
      {
        title: "Total Partners",
        value: stats.totalPartners,
        change: "+12%",
        icon: Building2,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Pending Applications",
        value: stats.pendingPartners,
        change: "+3",
        icon: Clock,
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50",
      },
      {
        title: "Approved Partners",
        value: stats.approvedPartners,
        change: "+8%",
        icon: CheckCircle,
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
      },
      {
        title: "Total Subscribers",
        value: stats.totalSubscribers.toLocaleString(),
        change: `+${stats.monthlyGrowth}%`,
        icon: Users,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'transparent', WebkitBackgroundClip: 'text' }} />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PartnersTable = ({ partners, isCompact = false }: { partners: any[], isCompact?: boolean }) => {
    const getStatusBadge = (status: string) => {
      const styles = {
        approved: "bg-green-100 text-green-800 border-green-200",
        pending: "bg-amber-100 text-amber-800 border-amber-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
      };
      
      const icons = {
        approved: CheckCircle,
        pending: Clock,
        rejected: XCircle,
      };

      const Icon = icons[status as keyof typeof icons];
      
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
          <Icon className="w-3 h-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Industry</th>
              {!isCompact && <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>}
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{partner.companyName}</div>
                  <div className="text-sm text-gray-500">{partner.location}</div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(partner.status)}
                </td>
                <td className="py-4 px-4">
                  <span className="capitalize text-gray-700">{partner.industry}</span>
                </td>
                {!isCompact && (
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{partner.contactPerson}</div>
                    <div className="text-xs text-gray-500">{partner.email}</div>
                  </td>
                )}
                <td className="py-4 px-4 text-sm text-gray-600">
                  {partner.submittedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const SubscribersTable = ({ subscribers, isCompact = false }: { subscribers: any[], isCompact?: boolean }) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Confirmed</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{subscriber.email}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {subscriber.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {subscriber.confirmed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {subscriber.subscribedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Sidebar = ({ activeTab, onTabChange, isSidebarOpen, onCloseSidebar }: any) => {
    return (
      <>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onCloseSidebar}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r border-gray-200
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                LUNA ADMIN
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 text-orange-600 border border-orange-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@luna.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          LUNA ADMIN
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
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
          onTabChange={handleTabChange}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <div className="hidden lg:flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "overview" ? "Dashboard Overview" : activeTab}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "overview" && "Welcome back! Here's what's happening."}
                {activeTab === "partners" && "Manage your business partnerships"}
                {activeTab === "subscribers" && "Track your email subscribers"}
                {activeTab === "users" && "User management system"}
                {activeTab === "settings" && "System configuration"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Search */}
              <div className={`flex items-center transition-all duration-300 ${
                isSearchBarOpen 
                  ? "bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm" 
                  : ""
              }`}>
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
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <div key={index} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
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
                              <p className="text-xs text-gray-600 mb-2">{notification.from.email}</p>
                              <p className="text-sm text-gray-700">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <StatsGrid stats={mockData.stats} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Growth Overview</h3>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+15.2% this month</span>
                      </div>
                    </div>
                    <div className="h-64 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl flex items-center justify-center">
                      <p className="text-gray-500">Chart visualization would go here</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 hover:from-yellow-100 hover:to-orange-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-gray-900">Approve Partners</span>
                        </div>
                      </button>
                      <button className="w-full p-3 text-left rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Send Newsletter</span>
                        </div>
                      </button>
                      <button className="w-full p-3 text-left rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">View Reports</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Partner Applications</h3>
                    </div>
                    <PartnersTable partners={mockData.partners.slice(0, 3)} isCompact />
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Subscribers</h3>
                    </div>
                    <SubscribersTable subscribers={mockData.subscribers.slice(0, 3)} isCompact />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "partners" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Partner Applications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage and review partnership requests
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-colors">
                      Add Partner
                    </button>
                  </div>
                </div>
                <PartnersTable partners={mockData.partners} />
              </div>
            )}

            {activeTab === "subscribers" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Subscribers</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage your newsletter subscribers
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-colors">
                      Export List
                    </button>
                  </div>
                </div>
                <SubscribersTable subscribers={mockData.subscribers} />
              </div>
            )}

            {(activeTab === "users" || activeTab === "settings") && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Settings className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Coming Soon</h3>
                  <p className="text-gray-600 mb-6">
                    This section is under development. We're working hard to bring you amazing new features!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Expected release: Q2 2024</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}