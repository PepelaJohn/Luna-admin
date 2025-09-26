"use client";

import React, { useState } from "react";
import { FinancialRecord } from "@/types/expenditure";
import StatusBadge from "./StatusBadge";
import { Eye, Edit, Trash2, MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface ExpenseTableProps {
  records: FinancialRecord[];
  onUpdateStatus?: (id: string, status: FinancialRecord['status']) => void;
  onDeleteRecord?: (id: string) => void;
  showType?: boolean;
  compact?: boolean;
}

export default function ExpenseTable({ 
  records, 
  onUpdateStatus, 
  onDeleteRecord, 
  showType = false,
  compact = false 
}: ExpenseTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {showType && <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>}
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Title</th>
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Amount</th>
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Category</th>
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Date</th>
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
            {!compact && <th className="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
              {showType && (
                <td className="px-4 py-3">
                  <div className={`p-1 rounded-full ${
                    record.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.type === 'income' ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600" />
                    )}
                  </div>
                </td>
              )}
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{record.title}</div>
                  <div className="text-sm text-gray-600 truncate max-w-xs">
                    {record.description}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`font-medium ${
                  record.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount, record.currency)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {record.category}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(record.date)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={record.status} />
              </td>
              {!compact && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/expenditure/${record.type === 'income' ? 'income' : 'expenses'}/${record.id}`}
                      className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-100 rounded"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/dashboard/expenditure/${record.type === 'income' ? 'income' : 'expenses'}/${record.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {records.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No records found.
        </div>
      )}
    </div>
  );
}