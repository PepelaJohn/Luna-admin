"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Filter, BarChart3 } from "lucide-react";
import { Expense, ExpenseFilters } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import ExpenseStats from "@/components/expenditure/ExpenseStats";
import ExpenseFilterPanel from "@/components/expenditure/ExpenseFilterPanel";
import BudgetChart from "@/components/expenditure/BudgetChart";
import { getExpenses, getBudgets } from "@/lib/expenditure";

export default function ExpenditureDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, budgetsData] = await Promise.all([
        getExpenses(),
        getBudgets()
      ]);
      setExpenses(expensesData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];
    
    if (filters.status) {
      filtered = filtered.filter(expense => expense.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredExpenses(filtered);
  };

  const handleUpdateStatus = async (id: string, status: Expense['status']) => {
    try {
      // In a real app, you would call updateExpenseStatus here
      // For now, we'll update locally
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? { ...expense, status, updatedAt: new Date() } : expense
      ));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      // In a real app, you would call deleteExpense here
      // For now, we'll update locally
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error("Failed to delete expense:", error);
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
          <h1 className="text-3xl font-bold flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">Expenditure Management</h1>
          <p className="text-slate-400 mt-1">Track and manage all expenses</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors">
            <Download size={18} />
            Export
          </button>
          <Link 
            href="/dashboard/expenditure/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            <Plus size={18} />
            New Expense
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <ExpenseStats expenses={expenses} />

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-4"
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

      {/* Budget Overview */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-orange-400" size={20} />
          <h2 className="text-xl font-semibold text-white">Budget Overview</h2>
        </div>
        <BudgetChart budgets={budgets} />
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Expenses</h2>
        <ExpenseTable 
          expenses={filteredExpenses}
          onUpdateStatus={handleUpdateStatus}
          onDeleteExpense={handleDeleteExpense}
        />
      </div>
    </div>
  );
}