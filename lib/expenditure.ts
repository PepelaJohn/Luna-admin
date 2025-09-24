import { Expense, Budget, ExpenseCategory, Income, BalanceSummary } from '@/types/expenditure';
import API from './api';

// Mock data -  API calls
let expenses: Expense[] = [
  {
    id: '1',
    title: 'Office Supplies',
    description: 'Purchased stationery for team',
    amount: 250.75,
    currency: 'USD',
    category: 'Office',
    status: 'approved',
    dateIncurred: new Date('2023-10-15'),
    dateSubmitted: new Date('2023-10-16'),
    dateApproved: new Date('2023-10-17'),
    submittedBy: 'admin@example.com',
    receiptUrl: '/receipts/office-supplies.pdf',
    createdAt: new Date('2023-10-16'),
    updatedAt: new Date('2023-10-17'),
  },
  {
    id: '2',
    title: 'Team Lunch',
    description: 'Monthly team building lunch',
    amount: 420.5,
    currency: 'USD',
    category: 'Team Building',
    status: 'pending',
    dateIncurred: new Date('2023-10-20'),
    dateSubmitted: new Date('2023-10-21'),
    submittedBy: 'manager@example.com',
    createdAt: new Date('2023-10-21'),
    updatedAt: new Date('2023-10-21'),
  },
  {
    id: '3',
    title: 'Software Subscription',
    description: 'Annual subscription for design software',
    amount: 1200,
    currency: 'USD',
    category: 'Software',
    status: 'paid',
    dateIncurred: new Date('2023-10-01'),
    dateSubmitted: new Date('2023-10-02'),
    dateApproved: new Date('2023-10-03'),
    datePaid: new Date('2023-10-05'),
    submittedBy: 'admin@example.com',
    receiptUrl: '/receipts/software-subscription.pdf',
    createdAt: new Date('2023-10-02'),
    updatedAt: new Date('2023-10-05'),
  },
  {
    id: '4',
    title: 'Business Travel',
    description: 'Flight and accommodation for conference',
    amount: 1850,
    currency: 'USD',
    category: 'Travel',
    status: 'approved',
    dateIncurred: new Date('2023-10-18'),
    dateSubmitted: new Date('2023-10-19'),
    dateApproved: new Date('2023-10-20'),
    submittedBy: 'sales@example.com',
    receiptUrl: '/receipts/travel-expenses.pdf',
    createdAt: new Date('2023-10-19'),
    updatedAt: new Date('2023-10-20'),
  },
  {
    id: '5',
    title: 'Marketing Materials',
    description: 'Brochures and promotional items',
    amount: 750,
    currency: 'USD',
    category: 'Marketing',
    status: 'draft',
    dateIncurred: new Date('2023-10-22'),
    dateSubmitted: new Date('2023-10-22'),
    submittedBy: 'marketing@example.com',
    createdAt: new Date('2023-10-22'),
    updatedAt: new Date('2023-10-22'),
  },
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



export const getFinancialRecords = async (filters?: any): Promise<any[]> => {
  await delay(500);
  
  // Combine expenses and incomes into financial records
  const expenseRecords = expenses.map(expense => ({
    id: expense.id,
    title: expense.title,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    type: 'expenditure' as const,
    status: expense.status,
    date: expense.dateIncurred,
    dateSubmitted: expense.dateSubmitted,
    dateApproved: expense.dateApproved,
    datePaid: expense.datePaid,
    submittedBy: expense.submittedBy,
    approvedBy: expense.approvedBy,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }));

  const incomeRecords = incomes.map(income => ({
    id: income.id,
    title: income.title,
    description: income.description,
    amount: income.amount,
    currency: income.currency,
    category: income.source,
    type: 'income' as const,
    status: 'paid' as const, // Incomes are typically paid when received
    date: income.dateReceived,
    dateSubmitted: income.dateReceived,
    dateApproved: income.dateReceived,
    datePaid: income.dateReceived,
    submittedBy: income.receivedBy,
    approvedBy: income.receivedBy,
    createdAt: income.createdAt,
    updatedAt: income.updatedAt,
  }));

  let records = [...incomeRecords, ...expenseRecords];
  
  if (!filters) return records;
  
  let filtered = [...records];
  
  if (filters.status) {
    filtered = filtered.filter(record => record.status === filters.status);
  }
  
  if (filters.category) {
    filtered = filtered.filter(record => record.category === filters.category);
  }
  
  if (filters.type) {
    filtered = filtered.filter(record => record.type === filters.type);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(record => 
      record.title.toLowerCase().includes(searchLower) ||
      record.description.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

export const getFinancialRecord = async (id: string): Promise<any | null> => {
  await delay(300);
  
  // Check expenses first
  const expense = expenses.find(expense => expense.id === id);
  if (expense) {
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: 'expenditure' as const,
      status: expense.status,
      date: expense.dateIncurred,
      dateSubmitted: expense.dateSubmitted,
      dateApproved: expense.dateApproved,
      datePaid: expense.datePaid,
      submittedBy: expense.submittedBy,
      approvedBy: expense.approvedBy,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
  
  // Check incomes
  const income = incomes.find(income => income.id === id);
  if (income) {
    return {
      id: income.id,
      title: income.title,
      description: income.description,
      amount: income.amount,
      currency: income.currency,
      category: income.source,
      type: 'income' as const,
      status: 'paid' as const,
      date: income.dateReceived,
      dateSubmitted: income.dateReceived,
      dateApproved: income.dateReceived,
      datePaid: income.dateReceived,
      submittedBy: income.receivedBy,
      approvedBy: income.receivedBy,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  }
  
  return null;
};

export const createFinancialRecord = async (recordData: Partial<any>): Promise<any> => {
  await delay(800);
  
  if (recordData.type === 'income') {
    const income: Income = {
      id: `inc_${Date.now()}`,
      title: recordData.title || '',
      description: recordData.description,
      amount: recordData.amount || 0,
      currency: recordData.currency || 'USD',
      source: recordData.category || 'other',
      dateReceived: recordData.date || new Date(),
      receivedBy: 'current-user@example.com',
      reference: recordData.reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    incomes.unshift(income);
    return {
      id: income.id,
      title: income.title,
      description: income.description,
      amount: income.amount,
      currency: income.currency,
      category: income.source,
      type: 'income' as const,
      status: 'paid' as const,
      date: income.dateReceived,
      dateSubmitted: income.dateReceived,
      dateApproved: income.dateReceived,
      datePaid: income.dateReceived,
      submittedBy: income.receivedBy,
      approvedBy: income.receivedBy,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  } else {
    // Default to expense
    const expense: Expense = {
      id: Date.now().toString(),
      title: recordData.title || '',
      description: recordData.description || '',
      amount: recordData.amount || 0,
      currency: recordData.currency || 'USD',
      category: recordData.category || 'Other',
      status: 'draft',
      dateIncurred: recordData.date || new Date(),
      dateSubmitted: new Date(),
      submittedBy: 'current-user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expenses.push(expense);
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: 'expenditure' as const,
      status: expense.status,
      date: expense.dateIncurred,
      dateSubmitted: expense.dateSubmitted,
      dateApproved: expense.dateApproved,
      datePaid: expense.datePaid,
      submittedBy: expense.submittedBy,
      approvedBy: expense.approvedBy,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
};

export const updateFinancialRecord = async (id: string, recordData: Partial<any>): Promise<any | null> => {
  await delay(600);
  
  // Check if it's an expense
  const expenseIndex = expenses.findIndex(expense => expense.id === id);
  if (expenseIndex !== -1) {
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      ...recordData,
      updatedAt: new Date()
    };
    const expense = expenses[expenseIndex];
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: 'expenditure' as const,
      status: expense.status,
      date: expense.dateIncurred,
      dateSubmitted: expense.dateSubmitted,
      dateApproved: expense.dateApproved,
      datePaid: expense.datePaid,
      submittedBy: expense.submittedBy,
      approvedBy: expense.approvedBy,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
  
  // Check if it's an income
  const incomeIndex = incomes.findIndex(income => income.id === id);
  if (incomeIndex !== -1) {
    incomes[incomeIndex] = {
      ...incomes[incomeIndex],
      ...recordData,
      updatedAt: new Date()
    } as Income;
    const income = incomes[incomeIndex];
    return {
      id: income.id,
      title: income.title,
      description: income.description,
      amount: income.amount,
      currency: income.currency,
      category: income.source,
      type: 'income' as const,
      status: 'paid' as const,
      date: income.dateReceived,
      dateSubmitted: income.dateReceived,
      dateApproved: income.dateReceived,
      datePaid: income.dateReceived,
      submittedBy: income.receivedBy,
      approvedBy: income.receivedBy,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  }
  
  return null;
};

export const updateRecordStatus = async (id: string, status: string, approvedBy?: string): Promise<any | null> => {
  await delay(500);
  
  // Check if it's an expense
  const expense = expenses.find(expense => expense.id === id);
  if (expense) {
    expense.status = status as any;
    expense.updatedAt = new Date();
    
    if (status === 'approved') {
      expense.dateApproved = new Date();
      expense.approvedBy = approvedBy || 'admin@example.com';
    } else if (status === 'paid') {
      expense.datePaid = new Date();
    }
    
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      type: 'expenditure' as const,
      status: expense.status,
      date: expense.dateIncurred,
      dateSubmitted: expense.dateSubmitted,
      dateApproved: expense.dateApproved,
      datePaid: expense.datePaid,
      submittedBy: expense.submittedBy,
      approvedBy: expense.approvedBy,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
  
  // Incomes typically don't have status changes in this system
  const income = incomes.find(income => income.id === id);
  if (income) {
    income.updatedAt = new Date();
    return {
      id: income.id,
      title: income.title,
      description: income.description,
      amount: income.amount,
      currency: income.currency,
      category: income.source,
      type: 'income' as const,
      status: 'paid' as const,
      date: income.dateReceived,
      dateSubmitted: income.dateReceived,
      dateApproved: income.dateReceived,
      datePaid: income.dateReceived,
      submittedBy: income.receivedBy,
      approvedBy: income.receivedBy,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  }
  
  return null;
};

// Financial Summary (NEW)
export const getFinancialSummary = async (): Promise<any> => {
  await delay(400);
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  const totalExpenses = expenses
    .filter(expense => expense.status === 'paid' || expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;
  const availableBudget = totalIncome - totalExpenses - pendingExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    pendingIncome: 0, // Incomes are immediately paid in this system
    pendingExpenses,
    availableBudget
  };
};

// Utility functions (NEW)
export const getAvailableBudget = async (): Promise<number> => {
  const summary = await getFinancialSummary();
  return summary.availableBudget;
};

export const deleteFinancialRecord = async (id: string): Promise<boolean> => {
  await delay(400);
  
  // Check expenses
  const expenseIndex = expenses.findIndex(expense => expense.id === id);
  if (expenseIndex !== -1) {
    expenses.splice(expenseIndex, 1);
    return true;
  }
  
  // Check incomes
  const incomeIndex = incomes.findIndex(income => income.id === id);
  if (incomeIndex !== -1) {
    incomes.splice(incomeIndex, 1);
    return true;
  }
  
  return false;
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