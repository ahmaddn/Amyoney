export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'other';
  balance: number;
  color?: string;
  isDefault?: boolean;
  isActive?: boolean;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
  monthlyBudget: number; // 0 jika tidak dialokasikan budget bulanan
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO 8601 YYYY-MM-DD
  categoryId?: string;
  walletId: string;
  toWalletId?: string; // Khusus transfer antar dompet
  note?: string;
  createdAt: string;
  updatedAt: string;
  syncedToFirebase?: boolean;
}

export interface BudgetPlan {
  id: string;
  name: string;
  totalBudget: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  isActive: boolean;
  allocations?: { [categoryId: string]: number }; // categoryId -> amount nominal
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress {
  category: Category;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

export interface MonthlyOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  totalAllocatedBudget: number;
  totalBudgetSpent: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color?: string;
  icon?: string;
  updatedAt: string;
}

export type DebtType = 'debt' | 'receivable'; // debt: saya berhutang, receivable: orang berhutang pada saya

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  remainingAmount: number;
  type: DebtType;
  dueDate?: string;
  note?: string;
  isSettled: boolean;
  createdAt: string;
  updatedAt: string;
}
