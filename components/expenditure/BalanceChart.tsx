"use client";

import React from "react";
import { FinancialRecord } from "@/types/expenditure";

interface BalanceChartProps {
  records: FinancialRecord[];
}

export default function BalanceChart({ records }: BalanceChartProps) {
  // Calculate monthly data
  const monthlyData = records.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }
    
    if (record.type === 'income') {
      acc[month].income += record.amount;
    } else {
      acc[month].expenses += record.amount;
    }
    
    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  const months = Object.keys(monthlyData).slice(-6); // Last 6 months

  if (months.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data available for chart</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...Object.values(monthlyData).map(d => Math.max(d.income, d.expenses))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-48">
        {months.map((month) => {
          const { income, expenses } = monthlyData[month];
          const incomeHeight = maxValue > 0 ? (income / maxValue) * 80 : 0;
          const expensesHeight = maxValue > 0 ? (expenses / maxValue) * 80 : 0;

          return (
            <div key={month} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center gap-1 mb-2 h-32">
                <div
                  className="w-4 bg-green-400 rounded-t transition-all"
                  style={{ height: `${incomeHeight}px` }}
                />
                <div
                  className="w-4 bg-red-400 rounded-t transition-all"
                  style={{ height: `${expensesHeight}px` }}
                />
              </div>
              <span className="text-xs text-gray-600 text-center">{month}</span>
              <div className="text-xs text-gray-500 mt-1 text-center">
                <div>I: ${income.toLocaleString()}</div>
                <div>E: ${expenses.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}