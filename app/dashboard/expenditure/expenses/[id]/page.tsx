"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Tag, FileText, Paperclip } from "lucide-react";
import { FinancialRecord } from "@/types/expenditure";
import { getFinancialRecord, deleteFinancialRecord } from "@/lib/expenditure";
import StatusBadge from "@/components/expenditure/StatusBadge";

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getFinancialRecord(id);

      if (!data) {
        setError("Expense not found");
        return;
      }

      setRecord(data);
    } catch (error: any) {
      console.error("Failed to load expense:", error);
      setError(error.message || "Failed to load expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFinancialRecord(id);
      router.push("/dashboard/expenditure/expenses");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense. Please try again.");
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
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
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/expenditure/expenses"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Expenses</span>
        </Link>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/expenditure/expenses/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{record.title}</h1>
            <p className="text-gray-600 mt-1">{record.description}</p>
          </div>
          {record.status && <StatusBadge status={record.status} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Amount */}
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-xl font-bold text-red-600">
                -{formatCurrency(record.amount, record.currency)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(record.date as any)}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {record.category}
              </p>
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Currency</p>
              <p className="text-lg font-semibold text-gray-900">
                {record.currency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {record.notes && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Additional Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      {/* Attachments */}
      {record.attachments && record.attachments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {record.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Paperclip size={20} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium text-gray-900">
              {record.createdAt ? formatDate(record.createdAt) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="font-medium text-gray-900">
              {record.updatedAt ? formatDate(record.updatedAt) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 