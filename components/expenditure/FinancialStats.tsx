import React from "react";
import { FinancialSummary } from "@/types/expenditure";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

interface FinancialStatsProps {
  summary: FinancialSummary;
}

export default function FinancialStats({ summary }: FinancialStatsProps) {
  console.log(summary)
  const stats = [
    {
      title: "Total Income",
      value: `$${summary?.totalIncome?.toLocaleString()  }`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "positive"
    },
    {
      title: "Total Expenses",
      value: `$${summary?.totalExpenditure?.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "negative"
    },
    {
      title: "Net Balance",
      value: `$${summary?.balance?.toLocaleString()}`,
      icon: DollarSign,
      color: summary?.balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: summary?.balance >= 0 ? "bg-green-50" : "bg-red-50",
      trend: summary?.balance >= 0 ? "positive" : "negative"
    },
    {
      title: "Available Budget",
      value: `$${summary?.availableBudget?.toLocaleString()}`,
      icon: AlertCircle,
      color: summary?.availableBudget > 0 ? "text-blue-600" : "text-orange-600",
      bgColor: summary?.availableBudget > 0 ? "bg-blue-50" : "bg-orange-50",
      trend: summary?.availableBudget > 0 ? "positive" : "warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
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