"use client";

import React, { useState } from "react";
import { Expense } from "@/types/expenditure";

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Partial<Expense>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const categories = [
  "Office Supplies",
  "Team Building",
  "Travel",
  "Software",
  "Hardware",
  "Marketing",
  "Training",
  "Other"
];

export default function ExpenseForm({ expense, onSubmit, onCancel, isSubmitting = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    title: expense?.title || "",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    currency: expense?.currency || "USD",
    category: expense?.category || "",
    dateIncurred: expense?.dateIncurred ? new Date(expense.dateIncurred).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receiptUrl: expense?.receiptUrl || "",
    notes: expense?.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dateIncurred: new Date(formData.dateIncurred),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Expense Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Office Supplies Purchase"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dateIncurred" className="block text-sm font-medium text-slate-300 mb-2">
            Date Incurred *
          </label>
          <input
            type="date"
            id="dateIncurred"
            name="dateIncurred"
            value={formData.dateIncurred}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Describe what this expense was for..."
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="receiptUrl" className="block text-sm font-medium text-slate-300 mb-2">
            Receipt URL (Optional)
          </label>
          <input
            type="url"
            id="receiptUrl"
            name="receiptUrl"
            value={formData.receiptUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://example.com/receipt.pdf"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Any additional information about this expense..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (expense ? 'Update Expense' : 'Create Expense')}
        </button>
      </div>
    </form>
  );
}