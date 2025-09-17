"use client";

import React, { useState } from "react";
import { Expense } from "@/types/expenditure";
import StatusBadge from "./StatusBadge";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface ExpenseTableProps {
  expenses: Expense[];
  onUpdateStatus: (id: string, status: Expense['status']) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseTable({ expenses, onUpdateStatus, onDeleteExpense }: ExpenseTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleStatusUpdate = (id: string, newStatus: Expense['status']) => {
    onUpdateStatus(id, newStatus);
    setActiveDropdown(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Title</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Amount</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Category</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-slate-700 hover:bg-slate-750">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-white">{expense.title}</div>
                  <div className="text-sm text-slate-400 truncate max-w-xs">
                    {expense.description}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-white">
                {formatCurrency(expense.amount, expense.currency)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                  {expense.category}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {formatDate(expense.dateIncurred)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={expense.status} />
              </td>
              <td className="px-4 py-3 relative">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/expenditure/${expense.id}`}
                    className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/expenditure/${expense.id}/edit`}
                    className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded"
                  >
                    <Edit size={16} />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === expense.id ? null : expense.id)}
                      className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === expense.id && (
                      <div className="absolute right-0 z-10 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        <div className="py-1">
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(expense.id, 'approved')}
                                className="block w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-slate-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(expense.id, 'rejected')}
                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {expense.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(expense.id, 'paid')}
                              className="block w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-slate-700"
                            >
                              Mark as Paid
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this expense?')) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {expenses.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No expenses found. Create your first expense to get started.
        </div>
      )}
    </div>
  );
}