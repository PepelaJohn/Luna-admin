"use client";

import React, { useState } from "react";
import { FinancialRecord } from "@/types/expenditure";
import FileUpload from "./FileUpload";

interface ExpenseFormProps {
  record?: FinancialRecord;
  type: 'income' | 'expenditure';
  onSubmit: (data: Partial<FinancialRecord>, files: File[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  availableBudget?: number;
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

export default function ExpenseForm({ 
  record, 
  type, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  availableBudget 
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    title: record?.title || "",
    description: record?.description || "",
    amount: record?.amount || 0,
    currency: record?.currency || "KES",
    category: record?.category || "",
    date: record?.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: record?.notes || "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's an expense that exceeds available budget
    if (type === 'expenditure' && availableBudget !== undefined && formData.amount > availableBudget) {
      setShowBudgetWarning(true);
      return;
    }
    
    onSubmit({
      ...formData,
      date: new Date(formData.date).toISOString(),
      type: type,
    }, files);
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const proceedDespiteWarning = () => {
    setShowBudgetWarning(false);
    onSubmit({
      ...formData,
      date: new Date(formData.date).toISOString(),
      type: type,
    }, files);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'income' ? 'Income Title' : 'Expense Title'} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={type === 'income' ? "e.g., Client Payment" : "e.g., Office Supplies"}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                KES
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
                className="w-full pl-10 pr- py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {type === 'expenditure' && availableBudget !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                Available budget: KES {availableBudget.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={type === 'income' ? "Describe the source of this income..." : "Describe what this expense was for..."}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Any additional information..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <FileUpload onFilesChange={handleFilesChange} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (record ? 'Update' : 'Create')} {type}
          </button>
        </div>
      </form>

      {/* Budget Warning Modal */}
      {showBudgetWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Exceeded</h3>
            <p className="text-gray-600 mb-4">
              This expense of ${formData.amount.toLocaleString()} exceeds your available budget of ${availableBudget?.toLocaleString()}. Do you want to proceed anyway?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBudgetWarning(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={proceedDespiteWarning}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}