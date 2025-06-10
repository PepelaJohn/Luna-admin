import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Mail, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';



// Main Dashboard Component
const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for demonstration
  const mockData = {
    partners: [
      { id: 1, companyName: 'Naivas Supermarket', status: 'approved', industry: 'retail', submittedAt: '2024-01-15' },
      { id: 2, companyName: 'Safaricom Ltd', status: 'pending', industry: 'telecommunications', submittedAt: '2024-01-14' },
      { id: 3, companyName: 'Equity Bank', status: 'reviewing', industry: 'finance', submittedAt: '2024-01-13' }
    ],
    subscribers: [
      { id: 1, email: 'john@example.com', confirmed: true, subscribedAt: '2024-01-15' },
      { id: 2, email: 'jane@example.com', confirmed: false, subscribedAt: '2024-01-14' },
      { id: 3, email: 'bob@example.com', confirmed: true, subscribedAt: '2024-01-13' }
    ],
    stats: {
      totalPartners: 45,
      pendingPartners: 12,
      approvedPartners: 28,
      totalSubscribers: 1250,
      confirmedSubscribers: 980,
      monthlyGrowth: 15.2
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'partners', label: 'Partners', icon: Building2 },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && sidebarItems.some(item => item.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to access the dashboard.</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          LunaDrone Admin
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center px-6 py-4 border-b border-slate-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              LunaDrone Admin
            </h1>
          </div>

          <nav className="mt-6 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 text-white border border-orange-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 capitalize">
                {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
              </h2>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Welcome back! Here's what's happening with your delivery network.
              </p>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Partners</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{mockData.stats.totalPartners}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-lg">
                        <Building2 className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{mockData.stats.monthlyGrowth}%</span>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Approval</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{mockData.stats.pendingPartners}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Subscribers</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{mockData.stats.totalSubscribers}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Confirmed</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{mockData.stats.confirmedSubscribers}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Recent Partner Applications</h3>
                    <div className="space-y-3">
                      {mockData.partners.slice(0, 3).map((partner) => (
                        <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm lg:text-base">{partner.companyName}</p>
                            <p className="text-xs lg:text-sm text-gray-500 capitalize">{partner.industry}</p>
                          </div>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                            {getStatusIcon(partner.status)}
                            <span className="ml-1 capitalize">{partner.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Recent Subscribers</h3>
                    <div className="space-y-3">
                      {mockData.subscribers.slice(0, 3).map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm lg:text-base">{subscriber.email}</p>
                            <p className="text-xs lg:text-sm text-gray-500">{new Date(subscriber.subscribedAt).toLocaleDateString()}</p>
                          </div>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.confirmed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {subscriber.confirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            {subscriber.confirmed ? 'Confirmed' : 'Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 lg:p-6 border-b">
                  <h3 className="text-lg font-semibold">Partner Applications</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage and review partnership requests</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockData.partners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{partner.companyName}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 capitalize">{partner.industry}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                              {getStatusIcon(partner.status)}
                              <span className="ml-1 capitalize">{partner.status}</span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(partner.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'subscribers' && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 lg:p-6 border-b">
                  <h3 className="text-lg font-semibold">Email Subscribers</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your newsletter subscribers</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockData.subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{subscriber.email}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              subscriber.confirmed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                            }`}>
                              {subscriber.confirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {subscriber.confirmed ? 'Confirmed' : 'Pending'}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeTab === 'users' || activeTab === 'settings') && (
              <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-gray-600 text-sm lg:text-base">
                    This section is under development. Check back soon for more features!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

export default App;