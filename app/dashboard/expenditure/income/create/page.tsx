"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExpenseForm from "@/components/expenditure/ExpenseForm";
import { FinancialRecord } from "@/types/expenditure";
import { createFinancialRecord } from "@/lib/expenditure";
import { uploadMultipleToImgbb, validateFiles } from "@/lib/imgbb-upload";

export default function CreateIncomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleSubmit = async (data: Partial<FinancialRecord>, files: File[]) => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress("");

    try {
      // Validate files first
      if (files.length > 0) {
        const validation = validateFiles(files);
        if (!validation.valid) {
          throw new Error(validation.errors.join('\n'));
        }

        // Upload files to ImgBB
        setUploadProgress(`Uploading ${files.length} file(s)...`);
        const uploadedAttachments = await uploadMultipleToImgbb(files);
        
        // Add attachments to data
        data.attachments = uploadedAttachments;
      }

      setUploadProgress("Saving income record...");
      
      await createFinancialRecord(data);
      
      // Redirect to income list on success
      router.push("/dashboard/expenditure/income");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to create income:", error);
      setError(error.message || "Failed to create income. Please try again.");
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/expenditure/income");
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Income</h1>
        <p className="text-gray-600 mt-1">Add a new income record</p>
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
          type="income"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}