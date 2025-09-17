export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'archived';
  dateIncurred: Date;
  dateSubmitted: Date;
  dateApproved?: Date;
  datePaid?: Date;
  submittedBy: string;
  approvedBy?: string;
  receiptUrl?: string;
  budgetId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  spent: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFilters {
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}