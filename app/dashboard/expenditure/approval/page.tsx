"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import ExpenseTable from "@/components/expenditure/ExpenseTable";
import { getFinancialRecords, updateRecordStatus } from "@/lib/expenditure";

export default function ApprovalPage() {
  const [pendingRecords, setPendingRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadPendingRecords();
  }, []);

  const loadPendingRecords = async () => {
    try {
      setIsLoading(true);
      const records = await getFinancialRecords({ status: 'pending' });
      setPendingRecords(records);
    } catch (error) {
      console.error("Failed to load pending records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setIsUpdating(true);
      await updateRecordStatus(id, 'approved');
      await loadPendingRecords(); // Reload the list
    } catch (error) {
      console.error("Failed to approve record:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsUpdating(true);
      await updateRecordStatus(id, 'rejected');
      await loadPendingRecords(); // Reload the list
    } catch (error) {
      console.error("Failed to reject record:", error);
    } finally {
      setIsUpdating(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="text-gray-600 mt-1">Review and approve pending transactions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>{pendingRecords.length} pending records</span>
        </div>
      </div>

      {/* Pending Records */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approval</h2>
        
        {pendingRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-gray-600">No pending records for approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ExpenseTable records={pendingRecords} compact />
            
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  if (confirm('Approve all pending records?')) {
                    pendingRecords.forEach(record => handleApprove(record.id));
                  }
                }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Approve All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}