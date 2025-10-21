"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Check, X, TrendingUp, TrendingDown } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import { getFinancialRecords, updateRecordStatus } from "@/lib/expenditure";

export default function ApprovalPage() {
  const [pendingRecords, setPendingRecords] = useState<FinancialRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadPendingRecords();
  }, []);

  const loadPendingRecords = async () => {
    try {
      setIsLoading(true);
      const records = await getFinancialRecords({status:"pending"});
      console.log(records);
      setPendingRecords(records);
    } catch (error) {
      console.error("Failed to load pending records:", error);
    } finally {
      setIsLoading(false);
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
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pendingRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRecords.map(r => r._id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApproveSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Approve ${selectedIds.size} selected record(s)?`)) return;

    try {
      setIsUpdating(true);
      
      // Approve each selected record
      await Promise.all(
        Array.from(selectedIds).map(id => updateRecordStatus(id, 'approved'))
      );
      
      setSelectedIds(new Set());
      await loadPendingRecords();
    } catch (error) {
      console.error("Failed to approve records:", error);
      alert("Failed to approve records. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Reject ${selectedIds.size} selected record(s)?`)) return;

    try {
      setIsUpdating(true);
      
      // Reject each selected record
      await Promise.all(
        Array.from(selectedIds).map(id => updateRecordStatus(id, 'rejected'))
      );
      
      setSelectedIds(new Set());
      await loadPendingRecords();
    } catch (error) {
      console.error("Failed to reject records:", error);
      alert("Failed to reject records. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveOne = async (id: string) => {
    if (!confirm('Approve this record?')) return;

    try {
      setIsUpdating(true);
      await updateRecordStatus(id, 'approved');
      await loadPendingRecords();
    } catch (error) {
      console.error("Failed to approve record:", error);
      alert("Failed to approve record. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectOne = async (id: string) => {
    if (!confirm('Reject this record?')) return;

    try {
      setIsUpdating(true);
      await updateRecordStatus(id, 'rejected');
      await loadPendingRecords();
    } catch (error) {
      console.error("Failed to reject record:", error);
      alert("Failed to reject record. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading pending records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Workflow</h1>
            <p className="text-gray-600 mt-1">Review and approve pending transactions</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">{pendingRecords.length} pending records</span>
          </div>
        </div>
      </div>

      {/* Pending Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Approval</h2>
        </div>

        {pendingRecords.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending records for approval.</p>
          </div>
        ) : (
          <>
            {/* Batch Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="bg-blue-50 border-b border-blue-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} record(s) selected
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleApproveSelected}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Selected
                    </button>
                    <button
                      onClick={handleRejectSelected}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Selected
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === pendingRecords.length && pendingRecords.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record) => (
                    <tr 
                      key={record._id} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        selectedIds.has(record._id) ? 'bg-blue-50' : ''
                      } ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record._id)}
                          onChange={() => handleSelectOne(record._id)}
                          disabled={isUpdating}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex p-1.5 rounded-full ${
                          record.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {record.type === 'income' ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : (
                            <TrendingDown size={16} className="text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{record.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {record.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          record.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount, record.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {formatDate(record.date as any)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveOne(record._id)}
                            disabled={isUpdating}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectOne(record._id)}
                            disabled={isUpdating}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}