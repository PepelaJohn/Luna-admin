"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { getFinancialRecord, updateFinancialRecord } from "@/lib/expenditure";

export default function EditIncomePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    if (!record) return;
    
    try {
      setIsSubmitting(true);
      await updateFinancialRecord(record.id, data);
      // Handle file uploads here
      console.log('Files to upload:', files);
      
      router.push(`/dashboard/expenditure/income/${record.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update record:", error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Income Record Not Found</h1>
        <p className="text-gray-600 mb-6">The income record you're trying to edit doesn't exist.</p>
        <Link 
          href="/dashboard/expenditure/income"
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          Back to Income
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/expenditure/income/${record.id}`}
          className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
          <p className="text-gray-600 mt-1">Update income details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ExpenseForm 
          record={record}
          type="income"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}