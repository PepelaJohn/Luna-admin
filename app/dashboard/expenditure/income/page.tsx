"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Filter, ArrowLeft } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import ExpenseFilterPanel from "@/components/expenditure/ExpenseFilterPanel";
import ExportDropdown from "@/components/expenditure/ExportDropdown";
import { getFinancialRecords } from "@/lib/expenditure";

export default function IncomePage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, records]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const recordsData = await getFinancialRecords({ type: 'income' });
      setRecords(recordsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = records.filter(record => record.type === 'income');
    
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/expenditure"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">Track all income sources</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            records={records}
            filteredRecords={filteredRecords}
            activeTab="income"
            filters={filters}
          />
          <Link 
            href="/dashboard/expenditure/income/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Plus size={18} />
            New Income
          </Link>
        </div>
      </div>

      {/* Filters */}
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
          />
        )}
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Records</h2>
        <ExpenseTable records={filteredRecords} />
      </div>
    </div>
  );
}