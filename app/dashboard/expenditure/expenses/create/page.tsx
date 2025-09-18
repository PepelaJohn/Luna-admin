"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { createFinancialRecord, getFinancialSummary } from "@/lib/expenditure";

export default function CreateExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBudget, setAvailableBudget] = useState<number>(0);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const summary = await getFinancialSummary();
      setAvailableBudget(summary.availableBudget);
    } catch (error) {
      console.error("Failed to load budget:", error);
    }
  };

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    setIsSubmitting(true);
    
    try {
      await createFinancialRecord({ ...data, type: 'expenditure' });
      // Handle file uploads here
      console.log('Files to upload:', files);
      
      router.push("/dashboard/expenditure/expenses");
      router.refresh();
    } catch (error) {
      console.error("Failed to create expense:", error);
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
          href="/dashboard/expenditure/expenses"
          className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Expense</h1>
          <p className="text-gray-600 mt-1">Add a new expenditure record</p>
          <p className="text-sm text-green-600 mt-1">
            Available Budget: ${availableBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ExpenseForm 
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