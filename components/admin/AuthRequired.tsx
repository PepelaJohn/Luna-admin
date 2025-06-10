'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, User, AlertCircle } from 'lucide-react';
import {Loader2} from 'lucide-react'
import './loader.css'
export default function         AuthenticationRequired() {
    const router = useRouter()
    

const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Optional: Auto-redirect after a few seconds
    const timer = setTimeout(() => {
    
    router.replace('/auth?auth=register')
    }, 5000);
setLoading(false)
    return () => clearTimeout(timer);
  }, []);

  const handleRedirectToLogin = () => {
    router.replace('/auth?auth=login')
  };

  const handleRedirectToRegister = () => {
    router.replace('/auth?auth=register')
  };

  return (
    <>
        {
            loading ? <LoadingScreen/> :<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-500 scale-100 backdrop-blur-sm">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
            LUNA ADMIN
          </h1>
          
          <h2 className="text-2xl font-semibold text-white mb-3">
            Access Restricted
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed">
            You need to be authenticated to access the dashboard. Please sign in to continue with your admin experience.
          </p>
        </div>

        {/* Alert Message */}
        <div className="mb-8 p-4 rounded-lg flex items-center gap-3 bg-orange-500/10 text-orange-400 border border-orange-500/30 backdrop-blur-sm">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Authentication Required</p>
            <p className="text-sm text-orange-300">
              Your session has expired or you haven't logged in yet.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRedirectToLogin}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <User className="w-5 h-5" />
            Sign In to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleRedirectToRegister}
            className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white font-medium py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
          >
            <Lock className="w-5 h-5" />
            Create New Account
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            You'll be automatically redirected to login in 5 seconds...
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-8 w-12 h-12 bg-gradient-to-r from-red-500/5 to-yellow-400/5 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
        }
    </>
  );
}



export  function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Main Loading Container */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-12 backdrop-blur-sm relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <span className="text-white font-bold text-3xl">L</span>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            LUNA ADMIN
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Main Spinner */}
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            
            {/* Outer Ring */}
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-400 border-r-orange-500 border-b-red-500 rounded-full animate-spin opacity-60"></div>
            
            {/* Inner Ring */}
            <div className="absolute inset-2 w-8 h-8 border-2 border-transparent border-t-red-400 border-l-yellow-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <p className="text-white font-medium text-lg mb-1">Loading Dashboard</p>
            <p className="text-slate-400 text-sm">Please wait while we prepare your experience...</p>
          </div>
          
          {/* Loading Dots Animation */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full animate-pulse animation-delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-red-500/10 to-yellow-400/10 rounded-full animate-pulse animation-delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400/5 to-red-500/5 rounded-full animate-pulse animation-delay-700"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-orange-400/30 rounded-full animate-ping animation-delay-300"></div>
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-yellow-400/40 rounded-full animate-ping animation-delay-600"></div>
      <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-red-400/20 rounded-full animate-ping animation-delay-900"></div>
      
      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-slate-800/10 pointer-events-none"></div>
    </div>
  );
}

