"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Filter } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import ExpenseFilterPanel from "@/components/expenditure/ExpenseFilterPanel";
import { getFinancialRecords, getFinancialSummary } from "@/lib/expenditure";

export default function ExpensesPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);
  const [availableBudget, setAvailableBudget] = useState<number>(0);
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
      const [recordsData, summaryData] = await Promise.all([
        getFinancialRecords({ type: 'expenditure' }),
        getFinancialSummary()
      ]);
      setRecords(recordsData);
      setAvailableBudget(summaryData.availableBudget);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = records.filter(record => record.type === 'expenditure');
    
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all expenses</p>
          <p className="text-sm text-green-600 mt-1">
            Available Budget: ${availableBudget.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <Download size={18} />
            Export
          </button>
          <Link 
            href="/dashboard/expenditure/expenses/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
          >
            <Plus size={18} />
            New Expense
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

      {/* Expenses Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Records</h2>
        <ExpenseTable records={filteredRecords} />
      </div>
    </div>
  );
}