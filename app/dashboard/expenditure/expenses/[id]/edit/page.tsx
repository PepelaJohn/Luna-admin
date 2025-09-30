"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { 
  getFinancialRecord, 
  updateFinancialRecord, 
  getFinancialSummary 
} from "@/lib/expenditure";
import { uploadMultipleToImgbb, validateFiles } from "@/lib/imgbb-upload";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBudget, setAvailableBudget] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [recordData, summary] = await Promise.all([
        getFinancialRecord(id),
        getFinancialSummary()
      ]);

      if (!recordData) {
        setError("Expense not found");
        return;
      }

      setRecord(recordData);
      setAvailableBudget(summary.availableBudget);
    } catch (error: any) {
      console.error("Failed to load expense:", error);
      setError(error.message || "Failed to load expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress("");

    try {
      // Handle new file uploads
      if (files.length > 0) {
        const validation = validateFiles(files);
        if (!validation.valid) {
          throw new Error(validation.errors.join('\n'));
        }

        // Upload new files to ImgBB
        setUploadProgress(`Uploading ${files.length} file(s)...`);
        const uploadedAttachments = await uploadMultipleToImgbb(files);
        
        // Merge with existing attachments
        const existingAttachments = record?.attachments || [];
        data.attachments = [...existingAttachments, ...uploadedAttachments];
      }

      setUploadProgress("Updating expense...");
      
      await updateFinancialRecord(id, data);
      
      // Redirect to expenses list on success
      router.push("/dashboard/expenditure/expenses");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update expense:", error);
      setError(error.message || "Failed to update expense. Please try again.");
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/expenditure/expenses");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link 
            href="/dashboard/expenditure/expenses"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Expenses</span>
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || "Expense not found"}</p>
          <Link
            href="/dashboard/expenditure/expenses"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-block"
          >
            Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/expenditure/expenses"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Expenses</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
        <p className="text-gray-600 mt-1">Update expense details</p>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 font-medium">{uploadProgress}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1 whitespace-pre-line">{error}</p>
        </div>
      )}

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