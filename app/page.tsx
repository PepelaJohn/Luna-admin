'use client'
import React from 'react';
import { 
  ArrowRight, 

  Zap, 
  Globe,
  
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LunaAdminHomepage() {
  const router = useRouter()
  const handleNavigateToDashboard = () => {
    router.push('/dashboard')
  };

 

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      

      {/* Hero Section */}
      <section className="relative h-full flex-1 flex items-center justify-center z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to 
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Luna Command Center
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Streamline your operations, monitor performance, and make data-driven decisions with our comprehensive administrative platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleNavigateToDashboard}
              className="flex items-center space-x-2 px-8 py-4 primary-btn-bg rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 text-lg"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="flex items-center space-x-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-slate-500 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 text-lg">
              <Globe className="w-5 h-5" />
              <span>View Documentation</span>
            </button>
          </div>
        </div>
      </section>

     

      

      

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 bg-slate-800/50 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 text-sm mb-2">
            Need assistance? Contact support at{' '}
            <a 
              href="mailto:support@lunadrone.com" 
              className="text-orange-400 hover:text-orange-300 underline transition-colors"
            >
              support@lunadrone.com
            </a>
          </p>
          <p className="text-slate-500 text-xs">
            © 2025 Luna Admin. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-to-r from-red-500/10 to-yellow-400/10 rounded-full blur-2xl"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-400/30 rounded-full animate-ping animation-delay-300"></div>
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-orange-400/40 rounded-full animate-ping animation-delay-600"></div>
      <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-yellow-400/20 rounded-full animate-ping animation-delay-900"></div>
      
      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-slate-800/10 pointer-events-none"></div>
    </div>
  );
}