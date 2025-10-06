"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { 
  getFinancialRecord, 
  updateFinancialRecord
} from "@/lib/expenditure";
import { uploadMultipleToImgbb, validateFiles } from "@/lib/imgbb-upload";

export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const recordData = await getFinancialRecord(id);

      if (!recordData) {
        setError("Income record not found");
        return;
      }

      setRecord(recordData);
    } catch (error: any) {
      console.error("Failed to load income:", error);
      setError(error.message || "Failed to load income");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress("");

    try {
      // Handle new file uploads
      if (files.length > 0) {
        const validation = validateFiles(files);
        if (!validation.valid) {
          throw new Error(validation.errors.join('\n'));
        }

        // Upload new files to ImgBB
        setUploadProgress(`Uploading ${files.length} file(s)...`);
        const uploadedAttachments = await uploadMultipleToImgbb(files);
        
        // Merge with existing attachments - properly serialize dates
        const existingAttachments = (record?.attachments || []).map(att => ({
          filename: att.filename,
          url: att.url,
          uploadedAt: att.uploadedAt instanceof Date 
            ? att.uploadedAt.toISOString() 
            : att.uploadedAt
        }));
        
        data.attachments = [...existingAttachments, ...uploadedAttachments];
      } else if (record?.attachments && record.attachments.length > 0) {
        // No new files, but preserve existing attachments with proper serialization
        data.attachments = record.attachments.map(att => ({
          filename: att.filename,
          url: att.url,
          uploadedAt: att.uploadedAt instanceof Date 
            ? att.uploadedAt.toISOString() 
            : att.uploadedAt
        }));
      }

      setUploadProgress("Updating income record...");
      
      await updateFinancialRecord(id, data, true);
      
      // Redirect to income list on success
      router.push("/dashboard/expenditure/income");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update income:", error);
      setError(error.message || "Failed to update income. Please try again.");
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/expenditure/income");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link 
            href="/dashboard/expenditure/income"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Income</span>
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || "Income record not found"}</p>
          <Link
            href="/dashboard/expenditure/income"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-block"
          >
            Back to Income
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/expenditure/income"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Income</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
        <p className="text-gray-600 mt-1">Update income record details</p>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 font-medium">{uploadProgress}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1 whitespace-pre-line">{error}</p>
        </div>
      )}

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