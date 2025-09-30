import React from "react";
import { FinancialRecord } from "@/types/expenditure";

interface StatusBadgeProps {
  status: FinancialRecord['status'];
}

const statusConfig: Record<FinancialRecord['status'], { color: string; bgColor: string; label: string }> = {
  draft: { color: "text-gray-700", bgColor: "bg-gray-100", label: "Draft" },
  pending: { color: "text-yellow-700", bgColor: "bg-yellow-100", label: "Pending" },
  approved: { color: "text-green-700", bgColor: "bg-green-100", label: "Approved" },
  rejected: { color: "text-red-700", bgColor: "bg-red-100", label: "Rejected" },
  paid: { color: "text-blue-700", bgColor: "bg-blue-100", label: "Paid" },
  // archived: { color: "text-purple-700", bgColor: "bg-purple-100", label: "Archived" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}