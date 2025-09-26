"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { getFinancialRecord, updateFinancialRecord, getFinancialSummary } from "@/lib/expenditure";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [availableBudget, setAvailableBudget] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recordData, summaryData] = await Promise.all([
        getFinancialRecord(id),
        getFinancialSummary()
      ]);
      setRecord(recordData);
      setAvailableBudget(summaryData.availableBudget);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    if (!record) return;
    
    try {
      setIsSubmitting(true);
      await updateFinancialRecord(record.id, data);
      // Handle file uploads here
      console.log('Files to upload:', files);
      
      router.push(`/dashboard/expenditure/expenses/${record.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
        <p className="text-gray-600 mb-6">The expense record you're trying to edit doesn't exist.</p>
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
          href={`/dashboard/expenditure/expenses/${record.id}`}
          className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600 mt-1">Update expense details</p>
          <p className="text-sm text-green-600 mt-1">
            Available Budget: ${availableBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ExpenseForm 
          record={record}
          type="expenditure"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          availableBudget={availableBudget}
        />
      </div>
    </div>
  );
}