"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { createFinancialRecord } from "@/lib/expenditure";

export default function CreateIncomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    setIsSubmitting(true);
    
    try {
      await createFinancialRecord({ ...data, type: 'income' });
      // Handle file uploads here (would be implemented with backend)
      console.log('Files to upload:', files);
      
      router.push("/dashboard/expenditure/income");
      router.refresh();
    } catch (error) {
      console.error("Failed to create income:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/expenditure/income"
          className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Income</h1>
          <p className="text-gray-600 mt-1">Add a new income record</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ExpenseForm 
          type="income"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}