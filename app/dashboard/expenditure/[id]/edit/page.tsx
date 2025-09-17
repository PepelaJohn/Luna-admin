"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { Expense } from "@/types/expenditure";
import { getExpense, updateExpense } from "@/lib/expenditure";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: Partial<Expense>) => {
    if (!expense) return;
    
    try {
      setIsSubmitting(true);
      await updateExpense(expense.id, data);
      router.push(`/dashboard/expenditure/${expense.id}`);
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

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Expense Not Found</h1>
        <p className="text-slate-400 mb-6">The expense you're trying to edit doesn't exist.</p>
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
          href={`/dashboard/expenditure/${expense.id}`}
          className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">Edit Expense</h1>
          <p className="text-slate-400 mt-1">Update expense details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800 rounded-xl p-6">
        <ExpenseForm 
          expense={expense}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}