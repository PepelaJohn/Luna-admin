"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Filter, ArrowLeft } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import ExpenseFilterPanel from "@/components/expenditure/ExpenseFilterPanel";
import ExportDropdown from "@/components/expenditure/ExportDropdown";
import { getFinancialRecords, getFinancialSummary, deleteFinancialRecord } from "@/lib/expenditure";

export default function ExpensesPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);
  const [availableBudget, setAvailableBudget] = useState<number>(0);
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, records]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [recordsData, summaryData] = await Promise.all([
        getFinancialRecords({ type: 'expenditure' }),
        getFinancialSummary()
      ]);
      
      setRecords(recordsData);
      setAvailableBudget(summaryData.availableBudget);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load expenses. Please try again.");
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

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteFinancialRecord(id);
      
      // Update local state
      setRecords(prev => prev.filter(record => record._id !== id));
      
      // Reload summary to update available budget
      const summaryData = await getFinancialSummary();
      setAvailableBudget(summaryData.availableBudget);
      
      // Show success message (optional - you could add a toast notification here)
      alert("Expense deleted successfully");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  const handleUpdateStatus = async (id: string, status: FinancialRecord['status']) => {
    // This would require adding a status field to the API
    // For now, you can implement this if you add status to your schema
    console.log("Update status:", id, status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Expenses</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all expenses</p>
          <p className="text-sm text-green-600 mt-1">
            Available Budget: ${availableBudget.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            records={records}
            filteredRecords={filteredRecords}
            activeTab="expenses"
            filters={filters}
          />
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Expense Records ({filteredRecords.length})
        </h2>
        <ExpenseTable 
          records={filteredRecords}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>
    </div>
  );
}