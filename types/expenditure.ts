export interface FinancialRecord {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  type: 'income' | 'expenditure';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' ;
  date: string;
  dateSubmitted: Date ;
  dateApproved?: Date;
  datePaid?: Date;
  submittedBy: string;
  approvedBy?: string;
  attachments: Attachment[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadedAt: Date | string;
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
  income: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  type: 'income' | 'expenditure';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFilters {
  status?: string;
  category?: string;
  type?: 'income' | 'expenditure';
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenditure: number;
  balance: number;

  availableBudget: number;
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'archived';
  dateIncurred: Date  ;
  dateSubmitted: Date  ;
  dateApproved?: Date  ;
  datePaid?: Date  ;
  submittedBy: string;
  approvedBy?: string;
  receiptUrl?: string;
  budgetId?: string;
  notes?: string;
  createdAt: Date  ;
  updatedAt: Date  ;
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

// New: Income tracking types
export interface Income {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  source: string; // e.g., "donation", "grant", "sales", etc.
  dateReceived: Date;
  receivedBy?: string;
  reference?: string; // transaction/reference id
  createdAt: Date;
  updatedAt: Date;
}

export interface BalanceSummary {
  totalIncome: number;
  totalPaidExpenses: number;
  totalApprovedNotPaid: number;
  availableFunds: number; // totalIncome - totalPaidExpenses
}