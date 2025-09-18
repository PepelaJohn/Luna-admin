import { FinancialRecord, FinancialSummary, Budget, ExpenseCategory } from '@/types/expenditure';

// Mock data - will be replaced with real API calls
let financialRecords: FinancialRecord[] = [
  {
    id: '1',
    title: 'Office Supplies',
    description: 'Purchased stationery for team',
    amount: 250.75,
    currency: 'USD',
    category: 'Office',
    type: 'expenditure',
    status: 'approved',
    date: new Date('2023-10-15'),
    dateSubmitted: new Date('2023-10-16'),
    dateApproved: new Date('2023-10-17'),
    submittedBy: 'admin@example.com',
    createdAt: new Date('2023-10-16'),
    updatedAt: new Date('2023-10-17'),
  },
  {
    id: '2',
    title: 'Client Payment - Project Alpha',
    description: 'Final payment for Project Alpha delivery',
    amount: 5000,
    currency: 'USD',
    category: 'Software',
    type: 'income',
    status: 'paid',
    date: new Date('2023-10-20'),
    dateSubmitted: new Date('2023-10-20'),
    dateApproved: new Date('2023-10-21'),
    datePaid: new Date('2023-10-22'),
    submittedBy: 'sales@example.com',
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-22'),
  },
  // Add more mock data...
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
    income: 12000,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-25'),
  },
  // Add more budgets...
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Financial Records API functions
export const getFinancialRecords = async (filters?: any): Promise<FinancialRecord[]> => {
  await delay(500);
  
  if (!filters) return financialRecords;
  
  let filtered = [...financialRecords];
  
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

export const getFinancialRecord = async (id: string): Promise<FinancialRecord | null> => {
  await delay(300);
  return financialRecords.find(record => record.id === id) || null;
};

export const createFinancialRecord = async (recordData: Partial<FinancialRecord>): Promise<FinancialRecord> => {
  await delay(800);
  
  const newRecord: FinancialRecord = {
    id: Date.now().toString(),
    title: recordData.title || '',
    description: recordData.description || '',
    amount: recordData.amount || 0,
    currency: recordData.currency || 'USD',
    category: recordData.category || 'Other',
    type: recordData.type || 'expenditure',
    status: 'draft',
    date: recordData.date || new Date(),
    dateSubmitted: new Date(),
    submittedBy: 'current-user@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...recordData
  };
  
  financialRecords.push(newRecord);
  return newRecord;
};

export const updateFinancialRecord = async (id: string, recordData: Partial<FinancialRecord>): Promise<FinancialRecord | null> => {
  await delay(600);
  
  const index = financialRecords.findIndex(record => record.id === id);
  if (index === -1) return null;
  
  financialRecords[index] = {
    ...financialRecords[index],
    ...recordData,
    updatedAt: new Date()
  };
  
  return financialRecords[index];
};

export const deleteFinancialRecord = async (id: string): Promise<boolean> => {
  await delay(400);
  
  const index = financialRecords.findIndex(record => record.id === id);
  if (index === -1) return false;
  
  financialRecords.splice(index, 1);
  return true;
};

export const updateRecordStatus = async (id: string, status: FinancialRecord['status'], approvedBy?: string): Promise<FinancialRecord | null> => {
  await delay(500);
  
  const record = financialRecords.find(record => record.id === id);
  if (!record) return null;
  
  record.status = status;
  record.updatedAt = new Date();
  
  if (status === 'approved') {
    record.dateApproved = new Date();
    record.approvedBy = approvedBy || 'admin@example.com';
  } else if (status === 'paid') {
    record.datePaid = new Date();
  }
  
  return record;
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

// Financial Summary
export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  await delay(400);
  
  const totalIncome = financialRecords
    .filter(record => record.type === 'income' && (record.status === 'paid' || record.status === 'approved'))
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalExpenses = financialRecords
    .filter(record => record.type === 'expenditure' && (record.status === 'paid' || record.status === 'approved'))
    .reduce((sum, record) => sum + record.amount, 0);
  
  const pendingIncome = financialRecords
    .filter(record => record.type === 'income' && record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const pendingExpenses = financialRecords
    .filter(record => record.type === 'expenditure' && record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;
  const availableBudget = totalIncome - totalExpenses - pendingExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    pendingIncome,
    pendingExpenses,
    availableBudget
  };
};

// Utility functions
export const getAvailableBudget = async (): Promise<number> => {
  const summary = await getFinancialSummary();
  return summary.availableBudget;
};