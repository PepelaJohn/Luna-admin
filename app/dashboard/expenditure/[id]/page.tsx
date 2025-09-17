"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Calendar, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from "lucide-react";
import { Expense } from "@/types/expenditure";
import StatusBadge from "@/components/expenditure/StatusBadge";
import { getExpense, updateExpenseStatus } from "@/lib/expenditure";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      setIsLoading(true);
      const expenseData = await getExpense(id);
      setExpense(expenseData);
    } catch (error) {
      console.error("Failed to load expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Expense['status']) => {
    if (!expense) return;
    
    try {
      setIsUpdating(true);
      await updateExpenseStatus(expense.id, newStatus);
      await loadExpense(); // Reload the expense data
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Expense Not Found</h1>
        <p className="text-slate-400 mb-6">The expense you're looking for doesn't exist.</p>
        <Link 
          href="/dashboard/expenditure"
          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/expenditure"
          className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{expense.title}</h1>
          <p className="text-slate-400 mt-1">{expense.description}</p>
        </div>
        <Link
          href={`/dashboard/expenditure/${expense.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <Edit size={18} />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Details Card */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Expense Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign size={16} />
                  <span className="text-sm">Amount</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText size={16} />
                  <span className="text-sm">Category</span>
                </div>
                <p className="text-lg font-medium text-white">{expense.category}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} />
                  <span className="text-sm">Date Incurred</span>
                </div>
                <p className="text-white">{formatDate(expense.dateIncurred)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={16} />
                  <span className="text-sm">Submitted By</span>
                </div>
                <p className="text-white">{expense.submittedBy}</p>
              </div>
              
              {expense.approvedBy && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Approved By</span>
                  </div>
                  <p className="text-white">{expense.approvedBy}</p>
                </div>
              )}
              
              {expense.dateApproved && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-sm">Date Approved</span>
                  </div>
                  <p className="text-white">{formatDate(expense.dateApproved)}</p>
                </div>
              )}
              
              {expense.datePaid && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-sm">Date Paid</span>
                  </div>
                  <p className="text-white">{formatDate(expense.datePaid)}</p>
                </div>
              )}
            </div>
            
            {expense.notes && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-medium text-white mb-2">Notes</h3>
                <p className="text-slate-300">{expense.notes}</p>
              </div>
            )}
          </div>

          {/* Status History Card */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Status History</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <Clock size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white">Created</p>
                    <p className="text-sm text-slate-400">{formatDate(expense.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status="draft" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white">Submitted</p>
                    <p className="text-sm text-slate-400">{formatDate(expense.dateSubmitted)}</p>
                  </div>
                </div>
                <StatusBadge status="pending" />
              </div>
              
              {expense.dateApproved && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <CheckCircle size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white">Approved</p>
                      <p className="text-sm text-slate-400">{formatDate(expense.dateApproved)}</p>
                    </div>
                  </div>
                  <StatusBadge status="approved" />
                </div>
              )}
              
              {expense.datePaid && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <DollarSign size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white">Paid</p>
                      <p className="text-sm text-slate-400">{formatDate(expense.datePaid)}</p>
                    </div>
                  </div>
                  <StatusBadge status="paid" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <StatusBadge status={expense.status} />
              <span className="text-sm text-slate-400">Updated {formatDate(expense.updatedAt)}</span>
            </div>
            
            {/* Status Actions */}
            <div className="space-y-3">
              {expense.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isUpdating}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Approve Expense
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject Expense
                  </button>
                </>
              )}
              
              {expense.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate('paid')}
                  disabled={isUpdating}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Paid
                </button>
              )}
              
              {(expense.status === 'rejected' || expense.status === 'paid') && (
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={isUpdating}
                  className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Return to Pending
                </button>
              )}
            </div>
          </div>

          {/* Receipt Card */}
          {expense.receiptUrl && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Receipt</h2>
              
              <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <FileText size={48} className="text-slate-400" />
              </div>
              
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Download size={18} />
                Download Receipt
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}