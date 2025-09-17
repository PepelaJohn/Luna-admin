"use client";

import React from "react";

interface Budget {
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetChartProps {
  budgets: Budget[];
}

export default function BudgetChart({ budgets }: BudgetChartProps) {
  // Handle case where budgets is undefined or empty
  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No budget data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget, index) => {
        // Add defensive checks for budget properties
        const allocated = budget.allocated || 0;
        const spent = budget.spent || 0;
        const percentage = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
        const isOverBudget = spent > allocated;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">{budget.name}</span>
              <span className="text-sm text-slate-400">
                ${spent.toLocaleString()} / ${allocated.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  isOverBudget 
                    ? 'bg-red-500' 
                    : percentage > 80 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {percentage.toFixed(1)}% utilized
              </span>
              {isOverBudget && (
                <span className="text-xs text-red-400 font-medium">
                  Over budget by ${(spent - allocated).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}