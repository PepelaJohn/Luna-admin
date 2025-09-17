import React from "react";
import { Expense } from "@/types/expenditure";

interface StatusBadgeProps {
  status: Expense['status'];
}

const statusConfig: Record<Expense['status'], { color: string; label: string }> = {
  draft: { color: "bg-slate-500 text-slate-200", label: "Draft" },
  pending: { color: "bg-yellow-500/20 text-yellow-300", label: "Pending" },
  approved: { color: "bg-green-500/20 text-green-300", label: "Approved" },
  rejected: { color: "bg-red-500/20 text-red-300", label: "Rejected" },
  paid: { color: "bg-blue-500/20 text-blue-300", label: "Paid" },
  archived: { color: "bg-purple-500/20 text-purple-300", label: "Archived" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}