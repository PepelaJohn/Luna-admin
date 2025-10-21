"use client";

import React from "react";
import { FinancialRecord } from "@/types/expenditure";

interface BalanceChartProps {
  records: FinancialRecord[];
}

export default function BalanceChart({ records }: BalanceChartProps) {
  // Calculate total income and expenses
  const totals = records.reduce(
    (acc, record) => {
      if (record.type === 'income') {
        acc.income += record.amount;
      } else {
        acc.expenses += record.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const total = totals.income + totals.expenses;
  

  if (total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Calculate percentages and angles
  const incomePercentage = (totals.income / total) * 100;
  const expensesPercentage = (totals.expenses / total) * 100;

  // For SVG pie chart using conic-gradient approach
  const incomeAngle = (totals.income / total) * 360;

  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span className="text-sm text-gray-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span className="text-sm text-gray-600">Expenses</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div 
          className="w-48 h-48 rounded-full relative"
          style={{
            background: `conic-gradient(
              #4ade80 0deg ${incomeAngle}deg,
              #f87171 ${incomeAngle}deg 360deg
            )`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  <span className=" text-xs">KES </span> 
                  {total}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2 w-full max-w-xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-700">Income</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                ${totals.income.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {incomePercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-sm text-gray-700">Expenses</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                ${totals.expenses.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {expensesPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}