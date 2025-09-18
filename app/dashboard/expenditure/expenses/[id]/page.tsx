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
  DollarSign,
  TrendingDown
} from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import StatusBadge from "@/components/expenditure/StatusBadge";
import { getFinancialRecord, updateRecordStatus } from "@/lib/expenditure";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      setIsLoading(true);
      const recordData = await getFinancialRecord(id);
      setRecord(recordData);
    } catch (error) {
      console.error("Failed to load record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: FinancialRecord['status']) => {
    if (!record) return;
    
    try {
      setIsUpdating(true);
      await updateRecordStatus(record.id, newStatus);
      await loadRecord(); // Reload the record data
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

  if (!record) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Expense Record Not Found</h1>
        <p className="text-gray-600 mb-6">The expense record you're looking for doesn't exist.</p>
        <Link 
          href="/dashboard/expenditure/expenses"
          className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
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
          href="/dashboard/expenditure/expenses"
          className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{record.title}</h1>
          <p className="text-gray-600 mt-1">{record.description}</p>
        </div>
        <Link
          href={`/dashboard/expenditure/expenses/${record.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <Edit size={18} />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Details Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={16} />
                  <span className="text-sm">Amount</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(record.amount, record.currency)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span className="text-sm">Category</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{record.category}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">Date Incurred</span>
                </div>
                <p className="text-gray-900">{formatDate(record.date)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <span className="text-sm">Submitted By</span>
                </div>
                <p className="text-gray-900">{record.submittedBy}</p>
              </div>
              
              {record.approvedBy && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={16} />
                    <span className="text-sm">Approved By</span>
                  </div>
                  <p className="text-gray-900">{record.approvedBy}</p>
                </div>
              )}
              
              {record.dateApproved && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">Date Approved</span>
                  </div>
                  <p className="text-gray-900">{formatDate(record.dateApproved)}</p>
                </div>
              )}
              
              {record.datePaid && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">Date Paid</span>
                  </div>
                  <p className="text-gray-900">{formatDate(record.datePaid)}</p>
                </div>
              )}
            </div>
            
            {record.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600">{record.notes}</p>
              </div>
            )}
          </div>

          {/* Status History Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status History</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(record.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status="draft" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Submitted</p>
                    <p className="text-sm text-gray-600">{formatDate(record.dateSubmitted)}</p>
                  </div>
                </div>
                <StatusBadge status="pending" />
              </div>
              
              {record.dateApproved && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Approved</p>
                      <p className="text-sm text-gray-600">{formatDate(record.dateApproved)}</p>
                    </div>
                  </div>
                  <StatusBadge status="approved" />
                </div>
              )}
              
              {record.datePaid && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TrendingDown size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Paid</p>
                      <p className="text-sm text-gray-600">{formatDate(record.datePaid)}</p>
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <StatusBadge status={record.status} />
              <span className="text-sm text-gray-600">Updated {formatDate(record.updatedAt)}</span>
            </div>
            
            {/* Status Actions */}
            <div className="space-y-3">
              {record.status === 'pending' && (
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
              
              {record.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate('paid')}
                  disabled={isUpdating}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Paid
                </button>
              )}
              
              {(record.status === 'rejected' || record.status === 'paid') && (
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

          {/* Attachments Card */}
          {record.attachments && record.attachments.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
              
              <div className="space-y-3">
                {record.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-900">{attachment.name}</span>
                    </div>
                    <Download size={16} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}