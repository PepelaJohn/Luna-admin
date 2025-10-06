import { Expense, Budget, ExpenseCategory, Income, BalanceSummary } from '@/types/expenditure';
import API from './api';
import { FinancialRecord } from '@/types/expenditure';
import { financialRecordsApi } from '@/lib/api';
// Mock data -  API calls
let expenses: Expense[] = [

];

let budgets: Budget[] = [
  {
    id: '1',
    name: 'Office Budget',
    description: 'Monthly office expenses',
    amount: 1000,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-31'),
    spent: 650,
    income: 0,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
  {
    id: '2',
    name: 'Team Building Budget',
    description: 'Team activities and events',
    amount: 800,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-31'),
    spent: 420,
    income: 0,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
  {
    id: '3',
    name: 'Travel Budget',
    description: 'Business travel expenses',
    amount: 2000,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-31'),
    spent: 1250,
    income: 0,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
  {
    id: '4',
    name: 'Software Budget',
    description: 'Software subscriptions and licenses',
    amount: 1500,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-31'),
    spent: 1200,
    income: 0,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
  {
    id: '5',
    name: 'Marketing Budget',
    description: 'Marketing and promotional expenses',
    amount: 1000,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-31'),
    spent: 750,
    income: 0,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
];

let categories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Office',
    description: 'Office supplies and equipment',
    color: '#3B82F6', // blue
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '2',
    name: 'Team Building',
    description: 'Team activities and events',
    color: '#F59E0B', // amber
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '3',
    name: 'Travel',
    description: 'Business travel expenses',
    color: '#10B981', // emerald
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '4',
    name: 'Software',
    description: 'Software subscriptions and licenses',
    color: '#8B5CF6', // violet
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '5',
    name: 'Marketing',
    description: 'Marketing and promotional expenses',
    color: '#EC4899', // pink
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '6',
    name: 'Hardware',
    description: 'Computer hardware and equipment',
    color: '#EF4444', // red
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '7',
    name: 'Training',
    description: 'Employee training and development',
    color: '#06B6D4', // cyan
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '8',
    name: 'Other',
    description: 'Miscellaneous expenses',
    color: '#6B7280', // gray
    type: 'expenditure',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
];

let incomes: Income[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Expense API functions
export const getExpenses = async (filters?: any): Promise<Expense[]> => {
  await delay(500);
  
  if (!filters) return expenses;
  
  let filtered = [...expenses];
  
  if (filters.status) {
    filtered = filtered.filter(expense => expense.status === filters.status);
  }
  
  if (filters.category) {
    filtered = filtered.filter(expense => expense.category === filters.category);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(expense => 
      expense.title.toLowerCase().includes(searchLower) ||
      expense.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.minAmount) {
    filtered = filtered.filter(expense => expense.amount >= filters.minAmount);
  }
  
  if (filters.maxAmount) {
    filtered = filtered.filter(expense => expense.amount <= filters.maxAmount);
  }
  
  return filtered;
};

export const getExpense = async (id: string): Promise<Expense | null> => {
  await delay(300);
  return expenses.find(expense => expense.id === id) || null;
};

export const createExpense = async (expenseData: Partial<Expense>): Promise<Expense> => {
  await delay(800);
  
  const newExpense: Expense = {
    id: Date.now().toString(),
    title: expenseData.title || '',
    description: expenseData.description || '',
    amount: expenseData.amount || 0,
    currency: expenseData.currency || 'USD',
    category: expenseData.category || 'Other',
    status: 'draft',
    dateIncurred: expenseData.dateIncurred || new Date(),
    dateSubmitted: new Date(),
    submittedBy: 'current-user@example.com', // This would come from auth context
    createdAt: new Date(),
    updatedAt: new Date(),
    ...expenseData
  };
  
  expenses.push(newExpense);
  return newExpense;
};

export const updateExpense = async (id: string, expenseData: Partial<Expense>): Promise<Expense | null> => {
  await delay(600);
  
  const index = expenses.findIndex(expense => expense.id === id);
  if (index === -1) return null;
  
  expenses[index] = {
    ...expenses[index],
    ...expenseData,
    updatedAt: new Date()
  };
  
  return expenses[index];
};

// Update expense receipt URL after successful upload
export const updateExpenseReceipt = async (id: string, receiptUrl: string): Promise<Expense | null> => {
  const expense = expenses.find(expense => expense.id === id);
  if (!expense) return null;
  
  expense.receiptUrl = receiptUrl;
  expense.updatedAt = new Date();
  
  return expense;
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  await delay(400);
  
  const index = expenses.findIndex(expense => expense.id === id);
  if (index === -1) return false;
  
  expenses.splice(index, 1);
  return true;
};

export const updateExpenseStatus = async (id: string, status: Expense['status'], approvedBy?: string): Promise<Expense | null> => {
  await delay(500);
  
  const expense = expenses.find(expense => expense.id === id);
  if (!expense) return null;
  
  // Enforce funding rules when attempting to mark as paid
  if (status === 'paid') {
    const balance = await getBalanceSummary();
    if (balance.availableFunds >= expense.amount) {
      expense.status = 'paid';
      expense.datePaid = new Date();
      expense.updatedAt = new Date();
      return expense;
    }
    // Insufficient funds: do not change status; caller can show a warning/toast
    return expense;
  }

  // Other statuses as before
  expense.status = status;
  expense.updatedAt = new Date();

  if (status === 'approved') {
    expense.dateApproved = new Date();
    expense.approvedBy = approvedBy || 'admin@example.com';
  } else if (status === 'rejected') {
    expense.approvedBy = approvedBy || 'admin@example.com';
  }

  return expense;
};

// Budget API functions
export const getBudgets = async (): Promise<Budget[]> => {
  await delay(500);
  return budgets;
};

export const getBudget = async (id: string): Promise<Budget | null> => {
  await delay(300);
  return budgets.find(budget => budget.id === id) || null;
};

export const createBudget = async (budgetData: Partial<Budget>): Promise<Budget> => {
  await delay(800);
  
  const newBudget: Budget = {
    id: Date.now().toString(),
    name: budgetData.name || '',
    description: budgetData.description || '',
    amount: budgetData.amount || 0,
    currency: budgetData.currency || 'USD',
    period: budgetData.period || 'monthly',
    startDate: budgetData.startDate || new Date(),
    endDate: budgetData.endDate || new Date(),
    spent: 0,
    category: budgetData.category,
    createdAt: new Date(),
    updatedAt: new Date(),
    income: 0
  };
  
  budgets.push(newBudget);
  return newBudget;
};

export const updateBudget = async (id: string, budgetData: Partial<Budget>): Promise<Budget | null> => {
  await delay(600);
  
  const index = budgets.findIndex(budget => budget.id === id);
  if (index === -1) return null;
  
  budgets[index] = {
    ...budgets[index],
    ...budgetData,
    updatedAt: new Date()
  };
  
  return budgets[index];
};

export const deleteBudget = async (id: string): Promise<boolean> => {
  await delay(400);
  
  const index = budgets.findIndex(budget => budget.id === id);
  if (index === -1) return false;
  
  budgets.splice(index, 1);
  return true;
};

// Category API functions
export const getCategories = async (): Promise<ExpenseCategory[]> => {
  await delay(400);
  return categories;
};

export const getCategory = async (id: string): Promise<ExpenseCategory | null> => {
  await delay(300);
  return categories.find(category => category.id === id) || null;
};

export const createCategory = async (categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
  await delay(600);
  
  const newCategory: ExpenseCategory = {
    id: Date.now().toString(),
    name: categoryData.name || '',
    description: categoryData.description || '',
    color: categoryData.color || '#6B7280',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'income'
  };
  
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = async (id: string, categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> => {
  await delay(500);
  
  const index = categories.findIndex(category => category.id === id);
  if (index === -1) return null;
  
  categories[index] = {
    ...categories[index],
    ...categoryData,
    updatedAt: new Date()
  };
  
  return categories[index];
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  await delay(300);
  
  const index = categories.findIndex(category => category.id === id);
  if (index === -1) return false;
  
  categories.splice(index, 1);
  return true;
};

// Report API functions
export const generateExpenseReport = async (filters?: any): Promise<any> => {
  await delay(1000);
  
  const filteredExpenses = await getExpenses(filters);
  
  // Calculate report statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = filteredExpenses.length;
  
  const byCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const byStatus = filteredExpenses.reduce((acc, expense) => {
    acc[expense.status] = (acc[expense.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    summary: {
      totalAmount,
      expenseCount,
      averageAmount: expenseCount > 0 ? totalAmount / expenseCount : 0,
    },
    byCategory,
    byStatus,
    expenses: filteredExpenses,
    generatedAt: new Date(),
  };
};

// Utility functions
export const getExpenseStats = async (): Promise<any> => {
  await delay(400);
  
  const allExpenses = await getExpenses();
  
  const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = allExpenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = allExpenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const paidAmount = allExpenses
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  return {
    totalAmount,
    pendingAmount,
    approvedAmount,
    paidAmount,
    expenseCount: allExpenses.length,
  };
};

// New: Income APIs and Balance computation (mock)
export const getIncomes = async (): Promise<Income[]> => {
  await delay(300);
  return incomes;
};

export const getIncome = async (id: string): Promise<Income | null> => {
  await delay(200);
  return incomes.find((i) => i.id === id) || null;
};

export const createIncome = async (incomeData: Partial<Income>): Promise<Income> => {
  await delay(600);
  const income: Income = {
    id: `inc_${Date.now()}`,
    title: incomeData.title || '',
    description: incomeData.description,
    amount: incomeData.amount || 0,
    currency: incomeData.currency || 'USD',
    source: incomeData.source || 'other',
    dateReceived: incomeData.dateReceived || new Date(),
    receivedBy: incomeData.receivedBy || 'finance@example.com',
    reference: incomeData.reference,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  incomes.unshift(income);
  // Attempt auto-allocation to unfunded expenses
  await autoAllocateFunds();
  return income;
};

export const updateIncome = async (id: string, incomeData: Partial<Income>): Promise<Income | null> => {
  await delay(500);
  const idx = incomes.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  incomes[idx] = { ...incomes[idx], ...incomeData, updatedAt: new Date() } as Income;
  // Re-run allocation if amount changed
  await autoAllocateFunds();
  return incomes[idx];
};

export const deleteIncome = async (id: string): Promise<boolean> => {
  await delay(300);
  const idx = incomes.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  incomes.splice(idx, 1);
  return true;
};

export const getBalanceSummary = async (): Promise<BalanceSummary> => {
  const allIncomes = await getIncomes();
  const allExpenses = await getExpenses();

  const totalIncome = allIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalPaidExpenses = allExpenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalApprovedNotPaid = allExpenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const availableFunds = totalIncome - totalPaidExpenses;

  return {
    totalIncome,
    totalPaidExpenses,
    totalApprovedNotPaid,
    availableFunds,
  };
};

// Attempt to pay any unfunded expenses if funds are now available
export const autoAllocateFunds = async (): Promise<void> => {
  // Pay oldest approved expenses first when funds allow
  const queue = expenses
    .filter((e) => e.status === 'approved')
    .sort((a, b) => a.dateSubmitted.getTime() - b.dateSubmitted.getTime());

  for (const exp of queue) {
    const balance = await getBalanceSummary();
    if (balance.availableFunds >= exp.amount) {
      exp.status = 'paid';
      exp.datePaid = new Date();
      exp.updatedAt = new Date();
    } else {
      break;
    }
  }
};

// File upload API functions
export const uploadReceiptFile = async (expenseId: string, file: File): Promise<{ success: boolean; receiptUrl?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('expenseId', expenseId);

    const response = await API.post(`/expenditure/${expenseId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.success) {
      return {
        success: true,
        receiptUrl: response.data.receiptUrl,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || 'Upload failed',
      };
    }
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Upload failed',
    };
  }
};

export const deleteReceiptFile = async (expenseId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await API.delete(`/expenditure/${expenseId}/receipt`);

    if (response.data?.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data?.error || 'Delete failed',
      };
    }
  } catch (error: any) {
    console.error('Receipt delete error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Delete failed',
    };
  }
};







// Utility functions (NEW)
export const getAvailableBudget = async (): Promise<number> => {
  const summary = await getFinancialSummary();
  return summary.availableBudget;
};



// File upload functions (mock for now)
export const uploadFiles = async (files: File[]): Promise<any[]> => {
  await delay(1000);
  
  return files.map((file, index) => ({
    id: `file-${Date.now()}-${index}`,
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type,
    size: file.size,
    uploadedAt: new Date()
  }));
};




// real api calls

// lib/expenditure.ts


export interface GetRecordsOptions {
  type?: 'income' | 'expenditure';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenditure: number;
  balance: number;
  availableBudget: number;
  incomeCount: number;
  expenditureCount: number;
}


export interface GetRecordsOptions {
  type?: 'income' | 'expenditure';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenditure: number;
  balance: number;
  availableBudget: number;
  incomeCount: number;
  expenditureCount: number;
}

/**
 * Fetch financial records with optional filters
 */
export async function getFinancialRecords(
  options: GetRecordsOptions = {}
): Promise<FinancialRecord[]> {
  try {
    const response = await financialRecordsApi.getAll(options);
    
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch records');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching financial records:', error);
    throw error;
  }
}

/**
 * Fetch a single financial record by ID
 */
export async function getFinancialRecord(id: string): Promise<FinancialRecord | null> {
  try {
    const response = await financialRecordsApi.getById(id);
    console.log(response)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch record');
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching financial record:', error);
    throw error;
  }
}

/**
 * Create a new financial record
 */
export async function createFinancialRecord(
  data: Partial<FinancialRecord>
): Promise<FinancialRecord> {
  try {
    const response = await financialRecordsApi.create(data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create record');
    }
    
    return response.data as unknown as FinancialRecord;
  } catch (error) {
    console.error('Error creating financial record:', error);
    throw error;
  }
}

/**
 * Update a financial record
 */
export async function updateFinancialRecord(
  id: string,
  data: Partial<FinancialRecord>,
  keepExistingAttachments: boolean = true
): Promise<FinancialRecord> {
  try {
    const response = await financialRecordsApi.update(
      id,
      data,
      keepExistingAttachments
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update record');
    }
    
    return response.data as unknown as FinancialRecord;
  } catch (error) {
    console.error('Error updating financial record:', error);
    throw error;
  }
}

/**
 * Delete a financial record
 */
export async function deleteFinancialRecord(id: string): Promise<void> {
  try {
    const response = await financialRecordsApi.delete(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete record');
    }
  } catch (error) {
    console.error('Error deleting financial record:', error);
    throw error;
  }
}

/**
 * Get financial summary statistics
 */
export async function getFinancialSummary(
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary> {
  try {
    const response = await financialRecordsApi.getStats(startDate, endDate);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch statistics');
    }
    
    const { summary } = response.data;
    
    return {
      totalIncome: summary.totalIncome,
      totalExpenditure: summary.totalExpenditure,
      balance: summary.balance,
      availableBudget: summary.balance, // Balance is available budget
      incomeCount: summary.incomeCount,
      expenditureCount: summary.expenditureCount,
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
}

/**
 * Get category breakdown for expenses
 */
export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string
) {
  try {
    const response = await financialRecordsApi.getStats(startDate, endDate);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch statistics');
    }
    
    return response.data.categoryBreakdown;
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }
}

/**
 * Update a financial record's status
 */
export async function updateRecordStatus(
  id: string,
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid'
): Promise<FinancialRecord> {
  try {
    const updateData: any = { status };
    
    // Add timestamp fields based on status
    if (status === 'approved') {
      updateData.dateApproved = new Date();
      // TODO: Add approvedBy from current user
    } else if (status === 'paid') {
      updateData.datePaid = new Date();
    } else if (status === 'pending') {
      updateData.dateSubmitted = new Date();
      // TODO: Add submittedBy from current user
    }
    
    const response = await financialRecordsApi.update(id, updateData, true);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update status');
    }
    
    return response.data as unknown as FinancialRecord;
  } catch (error) {
    console.error('Error updating record status:', error);
    throw error;
  }
}