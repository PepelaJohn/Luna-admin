

// ===========================================
// FILE: src/components/admin/StatsGrid.tsx
// ===========================================
'use client';

import React from 'react';
import { 
  Building2, 
  Clock, 
  Mail, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface StatsGridProps {
  stats: {
    totalPartners: number;
    pendingPartners: number;
    totalSubscribers: number;
    confirmedSubscribers: number;
    monthlyGrowth: number;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Partners</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalPartners}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-lg">
            <Building2 className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.pendingPartners}</p>
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
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalSubscribers}</p>
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
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.confirmedSubscribers}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
