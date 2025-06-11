"use client";
// import AuthenticationRequired from "@/components/admin/AuthRequired";
import Sidebar from "@/components/admin/SideBar";
import { useAuth } from "@/context/AuthContext";
// import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, Moon, Search, Sun, UserIcon, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  
  //   const {users, pagination, getUsers}= useData()

  const [popupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  //  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

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

  // Set active tab based on current URL - only run on client side


  return (
    <div className="min-h-screen bg-gray-50">
      {/* // Mobile header */}
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
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main content */}
        <div className="flex-1 max-h-screen overflow-hidden h-screen lg:ml-0">
          {DesktopHeader(
          
            setIsDarkMode,
            isDarkMode,
            isSearchBarOpen,
            setIsSearchBarOpen,
            popupRef,
            setIsPopupOpen,
            popupOpen,
            notifications,
            activeTab // Pass activeTab to header
          )}

          <div className="relative overflow-y-auto max-h-screen px-8 py-14">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;

function DesktopHeader(
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
  isDarkMode: boolean,
  isSearchBarOpen: boolean,
  setIsSearchBarOpen: React.Dispatch<React.SetStateAction<boolean>>,
  popupRef: React.RefObject<HTMLDivElement | null>,
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>,
  popupOpen: boolean,
  notifications: {
    from: { name: string; _id: string; email: string };
    to: { name: string; _id: string; email: string };
    message: string;
    createdAt: Date;
  }[],
  activeTab: string // Add activeTab parameter
) {
  console.log(activeTab)
  return (
    <div className="hidden lg:flex items-center justify-between p-4 bg-gray-100 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 capitalize">
          {activeTab === "overview" ? "Dashboard Overview" : activeTab}
        </h2>
        <p className="text-gray-600 mt-1">
          {activeTab === "dashboard" && "Welcome back! Here's what's happening."}
          {activeTab === "partners" && "Manage your business partnerships"}
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
            isSearchBarOpen ? "bg-white  rounded-full px-3 py-2 shadow-sm" : ""
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
                <h3 className="font-semibold text-gray-900">Notifications</h3>
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
  );
}