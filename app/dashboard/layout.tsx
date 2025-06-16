"use client";
// import AuthenticationRequired from "@/components/admin/AuthRequired";
import Sidebar from "@/components/admin/SideBar";
import { Bell, Menu, Moon, Search, Sun, UserIcon, X } from "lucide-react";
import React, { useState } from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  
  //   const {users, pagination, getUsers}= useData()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("dashboard"); 
  //  const [profileMenuOpen, setProfileMenuOpen] = useState(false);


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
          {/* {DesktopHeader(
          
            setIsDarkMode,
            isDarkMode,
            isSearchBarOpen,
            setIsSearchBarOpen,
            popupRef,
            setIsPopupOpen,
            popupOpen,
            notifications,
            activeTab // Pass activeTab to header
          )} */}

          <div className="relative overflow-y-auto max-h-screen px-8 py-14">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;

