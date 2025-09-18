import React from "react";
import { Expense } from "@/types/expenditure";
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface ExpenseStatsProps {
  expenses: Expense[];
}

export default function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = expenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const paidAmount = expenses
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: "Pending Approval",
      value: `$${pendingAmount.toLocaleString()}`,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      title: "Approved",
      value: `$${approvedAmount.toLocaleString()}`,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Paid",
      value: `$${paidAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}