import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Mail, 
  Settings, 
  X,
  FileText, // Add this icon for logs
  Activity   // Alternative icon for logs
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isSidebarOpen,
  onCloseSidebar,
}) => {
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and statistics"
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Manage system users"
    },
    {
      id: "partners",
      label: "Partners",
      icon: UserPlus,
      description: "Business partnerships"
    },
    {
      id: "subscribers",
      label: "Subscribers",
      icon: Mail,
      description: "Email subscribers"
    },
    {
      id: "logs",
      label: "Activity Logs",
      icon: Activity, // or FileText
      description: "System activity and audit trail"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "System configuration"
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-30 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              LUNA ADMIN
            </h1>
            <button
              onClick={onCloseSidebar}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Administration Dashboard
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs truncate ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Luna Admin
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;