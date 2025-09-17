import { Expense, Budget, ExpenseCategory } from '@/types/expenditure';

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
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '2',
    name: 'Team Building',
    description: 'Team activities and events',
    color: '#F59E0B', // amber
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '3',
    name: 'Travel',
    description: 'Business travel expenses',
    color: '#10B981', // emerald
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '4',
    name: 'Software',
    description: 'Software subscriptions and licenses',
    color: '#8B5CF6', // violet
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '5',
    name: 'Marketing',
    description: 'Marketing and promotional expenses',
    color: '#EC4899', // pink
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '6',
    name: 'Hardware',
    description: 'Computer hardware and equipment',
    color: '#EF4444', // red
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '7',
    name: 'Training',
    description: 'Employee training and development',
    color: '#06B6D4', // cyan
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    id: '8',
    name: 'Other',
    description: 'Miscellaneous expenses',
    color: '#6B7280', // gray
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01'),
  },
];

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
  
  expense.status = status;
  expense.updatedAt = new Date();
  
  // Set appropriate dates based on status
  if (status === 'approved') {
    expense.dateApproved = new Date();
    expense.approvedBy = approvedBy || 'admin@example.com';
  } else if (status === 'paid') {
    expense.datePaid = new Date();
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