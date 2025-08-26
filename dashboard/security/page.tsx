'use client'
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Tablet,
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  // Eye, 
  // EyeOff, 
  // Lock, 
  Key,
  Clock,
  Globe,
  Wifi,
  RefreshCw,
  // Settings,
  // Download,
  // Filter
} from 'lucide-react';
import { getSessions } from '@/lib/api';
import { usePopup } from '@/context/PopupContext';

// Types based on your API response
interface SessionData {
  _id: string;
  userId: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  device: string;
  browser: string;
  location: string;
  isCurrent?: boolean;
}

interface SecurityData {
  activeSessions: SessionData[];
  securitySettings: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    deviceTracking: boolean;
    suspiciousActivityBlocking: boolean;
    passwordLastChanged: string;
  };
}

const SecurityDashboard = () => {
  const [securityData, setSecurityData] = useState<SecurityData>({
    activeSessions: [],
    securitySettings: {
      twoFactorEnabled: true,
      loginAlerts: true,
      deviceTracking: true,
      suspiciousActivityBlocking: true,
      passwordLastChanged: new Date().toISOString()
    }
  });
  const {showError} = usePopup()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [showSessions, setShowSessions] = useState(true);

  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionsResponse = await getSessions();
      if (Array.isArray(sessionsResponse) && sessionsResponse.length > 0) {
        setSecurityData(prev => ({
          ...prev,
          activeSessions: sessionsResponse as SessionData[],
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      showError(`Error fetching sessions:${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get device icon based on user agent or device type
  const getDeviceIcon = (userAgent: string = '', device: string = '') => {
    const ua = userAgent.toLowerCase();
    const deviceLower = device.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad') || deviceLower.includes('tablet')) {
      return <Tablet className="w-4 h-4" />;
    }
    if (ua.includes('mac') || ua.includes('windows') || ua.includes('linux') || deviceLower.includes('desktop')) {
      return <Monitor className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
  };

  // Extract device type from user agent
  // const getDeviceType = (userAgent: string = '', device: string = '') => {
  //   const ua = userAgent.toLowerCase();
  //   const deviceLower = device.toLowerCase();
    
  //   if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || deviceLower.includes('mobile')) {
  //     return 'mobile';
  //   }
  //   if (ua.includes('tablet') || ua.includes('ipad') || deviceLower.includes('tablet')) {
  //     return 'tablet';
  //   }
  //   return 'desktop';
  // };

  // Get IP address from session (you may need to add this to your backend)
  const getSessionIP = (session: SessionData) => {
    if(session){}// For now, return a placeholder. You might want to add IP tracking to your Session model 
    return '•••.•••.•••.•••';
  };

  // Refresh data
  const refreshData = () => {
    fetchSessions();
  };

  // Terminate session
  const terminateSession = async (sessionId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to terminate session');
      }

      // Remove the session from local state
      setSecurityData(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session._id !== sessionId)
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
      console.error('Error terminating session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:pt-[100px] pt-[80px] bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                <p className="text-gray-600">Monitor and manage your account security</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Two-Factor Auth</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    securityData.securitySettings.twoFactorEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {securityData.securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Login Alerts</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    securityData.securitySettings.loginAlerts 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {securityData.securitySettings.loginAlerts ? 'On' : 'Off'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700">Device Tracking</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    securityData.securitySettings.deviceTracking 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {securityData.securitySettings.deviceTracking ? 'On' : 'Off'}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {/* Password last changed: {formatTimeAgo(securityData.securitySettings.passwordLastChanged)} */}
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
                  
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading && securityData.activeSessions.length === 0 ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-400" />
                    <p className="text-gray-500">Loading session details...</p>
                  </div>
                ) : securityData.activeSessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active sessions found.</p>
                    <button 
                      onClick={refreshData}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Try refreshing
                    </button>
                  </div>
                ) : (
                  securityData.activeSessions.map((session) => (
                    <div key={session._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                Active Session
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
                                active
                              </span>
                              {session.isCurrent && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                  Current Session
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="flex items-center space-x-1">
                                  {getDeviceIcon(session.userAgent, session.device)}
                                  <span>{session.device || session.browser || 'Unknown Device'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{session.location || 'Unknown Location'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{getSessionIP(session)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Started {formatTimeAgo(session.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {session.userAgent && (
                              <div className="text-xs text-gray-500 mb-2">
                                User Agent: {session.userAgent}
                              </div>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Last active: {formatTimeAgo(session.updatedAt)}</span>
                              {/* <span>Expires: {formatTimeAgo(session.expiresAt)}</span> */}
                            </div>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <button 
                            onClick={() => terminateSession(session._id)}
                            disabled={loading}
                            className="text-xs px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            Terminate Session
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default SecurityDashboard;