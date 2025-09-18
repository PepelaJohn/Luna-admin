"use client";

import React from "react";
import { BarChart3, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

interface TabsNavigationProps {
  activeTab: 'overview' | 'income' | 'expenses' | 'approval';
  onTabChange: (tab: 'overview' | 'income' | 'expenses' | 'approval') => void;
  pendingCount?: number;
}

export default function TabsNavigation({ activeTab, onTabChange, pendingCount = 0 }: TabsNavigationProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      color: 'text-gray-700',
      activeColor: 'text-orange-600'
    },
    {
      id: 'income',
      label: 'Income',
      icon: TrendingUp,
      color: 'text-green-600',
      activeColor: 'text-green-700'
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      color: 'text-red-600',
      activeColor: 'text-red-700'
    },
    {
      id: 'approval',
      label: 'Approval',
      icon: CheckCircle,
      color: 'text-blue-600',
      activeColor: 'text-blue-700',
      badge: pendingCount > 0 ? pendingCount : undefined
    }
  ];

  return (
    <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200 inline-flex">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              isActive
                ? 'bg-orange-50 text-orange-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} className={isActive ? tab.activeColor : tab.color} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}