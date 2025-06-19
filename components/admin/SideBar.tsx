"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Building2,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  LucideWorkflow,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  setActiveTab:React.Dispatch<React.SetStateAction<string>>;
  activeTab:string
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  onCloseSidebar,
  setActiveTab,
  activeTab
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // const [activeTab, setActiveTab] = useState<string>("dashboard"); // Default to dashboard
  const { user, logout } = useAuth();
const router = useRouter()
  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart3,
      description: "Overview & analytics",
      href: "/"
    },
    { 
      id: "partners", 
      label: "Partners", 
      icon: Building2,
      description: "Manage partnerships",
      
      href: "/partners"
    },
    { 
      id: "subscribers", 
      label: "Subscribers", 
      icon: Mail,
      description: "Email list management",
      href: "/subscribers"
    },
    { 
      id: "users", 
      label: "Users", 
      icon: Users,
      description: "User management",
      href: "/users"
    },
    {
      id: "logs",
      label: "Activity Logs",
      icon: FileText, 
      description: "System activity and audit trail",
      href: "/logs"
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: LucideWorkflow, 
      description: "Assigned tasks",
      href: "/tasks"
    },
  ];

  const profileMenuItems = [
    { 
      id: "profile", 
      label: "My Profile", 
      icon: User,
      action: () => {router.push('/profile')}
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings,
      action: () => console.log("Settings clicked")
    },
    { 
      id: "theme", 
      label: isDarkMode ? "Light Mode" : "Dark Mode", 
      icon: isDarkMode ? Sun : Moon,
      action: () => setIsDarkMode(!isDarkMode)
    },
    { 
      id: "help", 
      label: "Help & Support", 
      icon: HelpCircle,
      action: () => console.log("Help clicked")
    },
    { 
      id: "logout", 
      label: "Sign Out", 
      icon: LogOut,
      action: () => { logout() },
      danger: true
    },
  ];

  // Set active tab based on current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      // Handle different URL patterns
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        setActiveTab('dashboard');
      } else if (pathname.includes('/partners')) {
        setActiveTab('partners');
      } else if (pathname.includes('/subscribers')) {
        setActiveTab('subscribers');
      } else if (pathname.includes('/users')) {
        setActiveTab('users');
      } else if (pathname.includes('/logs')) {
        setActiveTab('logs');
      } else {
        // Fallback: try to extract from URL
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        const matchingItem = sidebarItems.find(item => 
          item.id === lastSegment || item.href.includes(lastSegment)
        );
        setActiveTab(matchingItem?.id || 'dashboard');
      }
    }
  }, []); // Remove activeTab from dependencies

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle menu item clicks
  const handleProfileMenuClick = (item: any) => {
    item.action();
    setProfileMenuOpen(false);
  };

  // Handle navigation item clicks
  const handleNavClick = (itemId: string) => {
    setActiveTab(itemId);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
          text-white transform transition-all duration-300 ease-in-out shadow-2xl
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center h-20 px-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <Link href={'/dashboard'} className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  LUNA ADMIN
                </Link>
                <p className="text-xs text-slate-400">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Main Navigation
              </p>
              <div className="space-y-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Link
                      href={`/dashboard${item.href}`}
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl 
                        transition-all duration-200 relative overflow-hidden
                        ${isActive
                          ? "bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 text-white border-orange-500/30 shadow-lg"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 rounded-r" />
                      )}
                      
                      <div className={`
                        p-2 rounded-lg mr-3 transition-colors
                        ${isActive 
                          ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20" 
                          : "bg-slate-700/50 group-hover:bg-slate-600/50"
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.label}</span>
                         
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="relative border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full p-4 flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-white capitalize truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-400 lowercase truncate">{user?.email || ""}</p>
                <p className="text-xs text-orange-400 capitalize font-medium">{user?.role || "Admin"}</p>
              </div>

              {/* Dropdown Arrow */}
              <ChevronDown 
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                  profileMenuOpen ? "rotate-180" : ""
                }`} 
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="py-2">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleProfileMenuClick(item)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                        transition-colors hover:bg-slate-700/50
                        ${item.danger ? "text-red-400 hover:text-red-300" : "text-slate-300 hover:text-white"}
                        ${index !== profileMenuItems.length - 1 ? "border-b border-slate-700/30" : ""}
                      `}
                    >
                      <div className={`
                        p-1.5 rounded-lg
                        ${item.danger 
                          ? "bg-red-500/10 text-red-400" 
                          : "bg-slate-700/50 text-slate-400"
                        }
                      `}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;