"use client";

import React from "react";
import { ExpenseFilters as ExpenseFiltersType } from "@/types/expenditure";

interface ExpenseFilterPanelProps {
  filters: ExpenseFiltersType;
  onFiltersChange: (filters: ExpenseFiltersType) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
  { value: "archived", label: "Archived" },
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "Office", label: "Office" },
  { value: "Team Building", label: "Team Building" },
  { value: "Travel", label: "Travel" },
  { value: "Software", label: "Software" },
  { value: "Hardware", label: "Hardware" },
  { value: "Marketing", label: "Marketing" },
  { value: "Training", label: "Training" },
  { value: "Other", label: "Other" },
];

export default function ExpenseFilterPanel({ filters, onFiltersChange }: ExpenseFilterPanelProps) {
  const handleChange = (field: keyof ExpenseFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
        <select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value || undefined)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
        <select
          value={filters.category || ""}
          onChange={(e) => handleChange("category", e.target.value || undefined)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Min Amount</label>
        <input
          type="number"
          value={filters.minAmount || ""}
          onChange={(e) => handleChange("minAmount", e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Min amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Max Amount</label>
        <input
          type="number"
          value={filters.maxAmount || ""}
          onChange={(e) => handleChange("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Max amount"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value || undefined)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Search by title or description..."
        />
      </div>

      <div className="md:col-span-2 flex items-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}