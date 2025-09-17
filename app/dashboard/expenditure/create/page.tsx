"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { Expense } from "@/types/expenditure";
import { createExpense } from "@/lib/expenditure";

export default function CreateExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Expense>) => {
    setIsSubmitting(true);
    
    try {
      await createExpense(data);
      router.push("/dashboard/expenditure");
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
          href="/dashboard/expenditure"
          className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">Create New Expense</h1>
          <p className="text-slate-400 mt-1">Add a new expenditure record</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800 rounded-xl p-6">
        <ExpenseForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}