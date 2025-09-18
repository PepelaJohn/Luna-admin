"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Filter, BarChart3, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { FinancialRecord, FinancialSummary } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import FinancialStats from "@/components/expenditure/FinancialStats";
import ExpenseFilterPanel from "@/components/expenditure/ExpenseFilterPanel";
import BalanceChart from "@/components/expenditure/BalanceChart";
import TabsNavigation from "@/components/expenditure/TabsNavigation";
import { getFinancialRecords, getFinancialSummary } from "@/lib/expenditure";

export default function ExpenditureDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'approval'>('overview');
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, records, activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recordsData, summaryData] = await Promise.all([
        getFinancialRecords(),
        getFinancialSummary()
      ]);
      setRecords(recordsData);
      setSummary(summaryData);
      
      // Count pending records for approval badge
      const pending = recordsData.filter(record => record.status === 'pending');
      setPendingCount(pending.length);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];
    
    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(record => record.category === filters.category);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchLower) ||
        record.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredRecords(filtered);
  };

  const getActionButton = () => {
    switch (activeTab) {
      case 'income':
        return (
          <Link 
            href="/dashboard/expenditure/income/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Plus size={18} />
            New Income
          </Link>
        );
      case 'expenses':
        return (
          <Link 
            href="/dashboard/expenditure/expenses/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
          >
            <Plus size={18} />
            New Expense
          </Link>
        );
      case 'approval':
        return (
          <Link 
            href="/dashboard/expenditure/approval"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <CheckCircle size={18} />
            Review Approval
          </Link>
        );
      default:
        return (
          <div className="flex gap-2">
            <Link 
              href="/dashboard/expenditure/income/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <TrendingUp size={18} />
              Add Income
            </Link>
            <Link 
              href="/dashboard/expenditure/expenses/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
            >
              <TrendingDown size={18} />
              Add Expense
            </Link>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Track income and expenditures</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <Download size={18} />
            Export
          </button>
          {getActionButton()}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} />

      {/* Overview Stats */}
      {activeTab === 'overview' && summary && (
        <FinancialStats summary={summary} />
      )}

      {/* Filters */}
      {(activeTab === 'overview' || activeTab === 'income' || activeTab === 'expenses') && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {showFilters && (
            <ExpenseFilterPanel 
              filters={filters} 
              onFiltersChange={setFilters} 
              includeTypeFilter={activeTab === 'overview'}
            />
          )}
        </div>
      )}

      {/* Balance Chart */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-orange-500" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
          </div>
          <BalanceChart records={records} />
        </div>
      )}

      {/* Approval Dashboard */}
      {activeTab === 'approval' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-blue-500" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Approval Dashboard</h2>
          </div>
          
          {pendingCount === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending records requiring approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">{pendingCount} Pending Records</h3>
                    <p className="text-sm text-blue-700">Need your review and approval</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/expenditure/approval"
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Income Approval</h4>
                      <p className="text-sm text-gray-600">Review incoming funds</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/expenditure/approval"
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <TrendingDown className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Expense Approval</h4>
                      <p className="text-sm text-gray-600">Review outgoing funds</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/expenditure/approval"
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                  >
                    Review All
                  </Link>
                  <Link
                    href="/dashboard/expenditure/income/create"
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    Add Income
                  </Link>
                  <Link
                    href="/dashboard/expenditure/expenses/create"
                    className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors"
                  >
                    Add Expense
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Records Table */}
      {(activeTab === 'overview' || activeTab === 'income' || activeTab === 'expenses') && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {activeTab === 'overview' ? 'All Transactions' : 
             activeTab === 'income' ? 'Income Records' : 'Expense Records'}
          </h2>
          
          <ExpenseTable 
            records={filteredRecords.filter(record => 
              activeTab === 'overview' ? true : 
              activeTab === 'income' ? record.type === 'income' : 
              record.type === 'expenditure'
            )}
            showType={activeTab === 'overview'}
          />
        </div>
      )}
    </div>
  );
}