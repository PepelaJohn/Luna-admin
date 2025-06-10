'use client'
import React from 'react';
import { Shield,  ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function UnauthorizedPage() {
 
const router = useRouter()
  const handleGoHome = () => {
    router.replace('/')
  };
   const handleGoBack = () => {
   router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Main Content Container */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-12 backdrop-blur-sm relative z-10 max-w-2xl w-full text-center">
        
        {/* Logo Section */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">L</span>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            LUNA ADMIN
          </h1>
        </div>

        {/* Error Icon and Animation */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          <div className="relative">
            {/* Main Shield Icon */}
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
            
            
            
            {/* Pulsing Ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-red-500/30 rounded-full animate-ping"></div>
          </div>
          
          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white mb-2">Access Denied</h2>
            <div className="space-y-2">
              <p className="text-red-400 font-medium text-lg">401 - Unauthorized</p>
              <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                You don't have permission to access this resource. Please contact your administrator or sign in with proper credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 min-w-[140px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 min-w-[140px]"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-slate-500 text-sm">
            Need help? Contact support at{' '}
            <a 
              href="mailto:support@lunadrone.com" 
              className="text-orange-400 hover:text-orange-300 underline transition-colors"
            >
              support@lunadrone.com
            </a>
          </p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-orange-500/10 to-yellow-400/10 rounded-full animate-pulse animation-delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-full animate-pulse animation-delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-red-500/5 to-yellow-400/5 rounded-full animate-pulse animation-delay-700"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-400/30 rounded-full animate-ping animation-delay-300"></div>
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-orange-400/40 rounded-full animate-ping animation-delay-600"></div>
      <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-yellow-400/20 rounded-full animate-ping animation-delay-900"></div>
      
      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-slate-800/10 pointer-events-none"></div>
    </div>
  );
}