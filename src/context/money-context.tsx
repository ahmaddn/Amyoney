import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { dbRepository, initDatabase } from '@/db/database';
import { firestoreService } from '@/services/firestore-service';
import {
  BudgetProgress,
  Category,
  Debt,
  MonthlyOverview,
  SavingGoal,
  Transaction,
  Wallet,
} from '@/types/money';
import { getCurrentMonthRange } from '@/utils/format';

export interface MoneyContextType {
  loading: boolean;
  error: string | null;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  savingGoals: SavingGoal[];
  debts: Debt[];
  overview: MonthlyOverview;
  budgetProgress: BudgetProgress[];
  refresh: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateCategoryBudget: (categoryId: string, monthlyBudget: number) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'updatedAt'>) => Promise<Category>;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id' | 'updatedAt'>) => Promise<Wallet>;
  deleteWallet: (walletId: string) => Promise<void>;
  resetAllWalletBalances: () => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'updatedAt'>) => Promise<void>;
  updateSavingGoalProgress: (id: string, addedAmount: number) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  settleDebt: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

const MoneyContext = createContext<MoneyContextType | null>(null);

export function MoneyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    try {
      await initDatabase();
      const [w, c, t, sg, d] = await Promise.all([
        dbRepository.getWallets(),
        dbRepository.getCategories(),
        dbRepository.getTransactions(200),
        dbRepository.getSavingGoals(),
        dbRepository.getDebts(),
      ]);
      setWallets(w);
      setCategories(c);
      setTransactions(t);
      setSavingGoals(sg);
      setDebts(d);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sinkronisasi data awal & Firestore listener jika user login
  useEffect(() => {
    let unsubWallets = () => {};
    let unsubCategories = () => {};
    let unsubTransactions = () => {};

    if (!user) {
      reloadData();
      return;
    }

    setLoading(true);
    // Muat data lokal dulu agar instan muncul
    reloadData().then(() => {
      unsubWallets = firestoreService.subscribeWallets(user.uid, (w) => {
        if (w.length === 0) {
          firestoreService.seedInitialUserData(user.uid);
        } else {
          setWallets(w);
        }
      });

      unsubCategories = firestoreService.subscribeCategories(user.uid, (c) => {
        setCategories(c);
      });

      unsubTransactions = firestoreService.subscribeTransactions(user.uid, (t) => {
        setTransactions(t);
        setLoading(false);
      });
    });

    return () => {
      unsubWallets();
      unsubCategories();
      unsubTransactions();
    };
  }, [user, reloadData]);

  // Kalkulasi agregasi arus kas bulan ini secara reaktif
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const currentMonthTransactions = transactions.filter(
    (tx) => tx.date >= monthStart && tx.date <= monthEnd
  );

  const totalBalance = wallets
    .filter((w) => w.isActive !== false)
    .reduce((sum, w) => sum + w.balance, 0);

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  for (const tx of currentMonthTransactions) {
    if (tx.type === 'income') monthlyIncome += tx.amount;
    if (tx.type === 'expense') monthlyExpense += tx.amount;
  }
  const netCashFlow = monthlyIncome - monthlyExpense;

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const totalAllocatedBudget = expenseCategories.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  const budgetProgress: BudgetProgress[] = expenseCategories
    .filter((c) => c.monthlyBudget > 0)
    .map((cat) => {
      const spent = currentMonthTransactions
        .filter((tx) => tx.categoryId === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const allocated = cat.monthlyBudget;
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
      return {
        category: cat,
        allocated,
        spent,
        remaining,
        percentUsed,
        isOverBudget: spent > allocated,
      };
    });

  const totalBudgetSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);

  const overview: MonthlyOverview = {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netCashFlow,
    totalAllocatedBudget,
    totalBudgetSpent,
  };

  /**
   * 1. Tambah Transaksi Secara Optimistik & Instan
   */
  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTx: Transaction = { ...tx, createdAt: now, updatedAt: now };

      // OPTIMISTIC STATE UPDATE: Langsung update state React agar detik itu juga muncul di UI!
      setTransactions((prev) => [newTx, ...prev]);

      setWallets((prev) =>
        prev.map((w) => {
          if (tx.type === 'expense' && w.id === tx.walletId) {
            return { ...w, balance: w.balance - tx.amount };
          }
          if (tx.type === 'income' && w.id === tx.walletId) {
            return { ...w, balance: w.balance + tx.amount };
          }
          if (tx.type === 'transfer') {
            if (w.id === tx.walletId) return { ...w, balance: w.balance - tx.amount };
            if (w.id === tx.toWalletId) return { ...w, balance: w.balance + tx.amount };
          }
          return w;
        })
      );

      // Persistence di latar belakang ke SQLite & Firestore
      try {
        await dbRepository.addTransaction(tx);
        if (user) {
          await firestoreService.addTransaction(user.uid, newTx, wallets);
        }
      } catch (err) {
        console.error('Failed to persist transaction:', err);
      }
    },
    [user, wallets]
  );

  /**
   * 2. Hapus Transaksi Secara Optimistik & Instan
   */
  const deleteTransaction = useCallback(
    async (id: string) => {
      const targetTx = transactions.find((t) => t.id === id);
      if (!targetTx) return;

      // OPTIMISTIC STATE UPDATE
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      setWallets((prev) =>
        prev.map((w) => {
          if (targetTx.type === 'expense' && w.id === targetTx.walletId) {
            return { ...w, balance: w.balance + targetTx.amount };
          }
          if (targetTx.type === 'income' && w.id === targetTx.walletId) {
            return { ...w, balance: w.balance - targetTx.amount };
          }
          if (targetTx.type === 'transfer') {
            if (w.id === targetTx.walletId) return { ...w, balance: w.balance + targetTx.amount };
            if (w.id === targetTx.toWalletId) return { ...w, balance: w.balance - targetTx.amount };
          }
          return w;
        })
      );

      // Background persistence
      try {
        await dbRepository.deleteTransaction(id);
        if (user) {
          await firestoreService.deleteTransaction(user.uid, targetTx, wallets);
        }
      } catch (err) {
        console.error('Failed to persist delete transaction:', err);
      }
    },
    [user, transactions, wallets]
  );

  /**
   * 3. Update Pagu Kategori Secara Optimistik & Instan
   */
  const updateCategoryBudget = useCallback(
    async (categoryId: string, monthlyBudget: number) => {
      // OPTIMISTIC UPDATE
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget } : c))
      );

      try {
        await dbRepository.updateCategoryBudget(categoryId, monthlyBudget);
        if (user) {
          await firestoreService.updateCategoryBudget(user.uid, categoryId, monthlyBudget);
        }
      } catch (err) {
        console.error('Failed to update category budget:', err);
      }
    },
    [user]
  );

  /**
   * 4. Ubah Detail Kategori (Nama, Warna, Ikon)
   */
  const updateCategory = useCallback(
    async (categoryId: string, updates: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
      );

      try {
        await dbRepository.updateCategory(categoryId, updates);
        if (user) {
          await firestoreService.updateCategory(user.uid, categoryId, updates);
        }
      } catch (err) {
        console.error('Failed to update category:', err);
      }
    },
    [user]
  );

  /**
   * 5. Tambah Kategori Baru Secara Optimistik & Instan
   */
  const addCategory = useCallback(
    async (cat: Omit<Category, 'id' | 'updatedAt'>) => {
      const id = `c_custom_${Date.now()}`;
      const now = new Date().toISOString();
      const newCat: Category = { ...cat, id, updatedAt: now };

      // OPTIMISTIC UPDATE
      setCategories((prev) => [...prev, newCat]);

      try {
        await dbRepository.addCategory(newCat);
        if (user) {
          await firestoreService.addCategory(user.uid, newCat);
        }
      } catch (err) {
        console.error('Failed to add category:', err);
      }
      return newCat;
    },
    [user]
  );

  /**
   * 6. Hapus Kategori Secara Optimistik & Instan
   */
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      // OPTIMISTIC UPDATE
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));

      try {
        await dbRepository.deleteCategory(categoryId);
        if (user) {
          await firestoreService.deleteCategory(user.uid, categoryId);
        }
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    },
    [user]
  );

  /**
   * 7. Kelola Dompet: Tambah Dompet Baru
   */
  const addWallet = useCallback(
    async (walletData: Omit<Wallet, 'id' | 'updatedAt'>) => {
      const id = `w_custom_${Date.now()}`;
      const now = new Date().toISOString();
      const newWallet: Wallet = { ...walletData, id, updatedAt: now };

      // OPTIMISTIC UPDATE
      setWallets((prev) => [...prev, newWallet]);

      try {
        await dbRepository.addWallet(newWallet);
        if (user) {
          await firestoreService.addWallet(user.uid, newWallet);
        }
      } catch (err) {
        console.error('Failed to add wallet:', err);
      }
      return newWallet;
    },
    [user]
  );

  /**
   * 8. Kelola Dompet: Ubah Dompet (Nama, Saldo, Status Aktif)
   */
  const updateWallet = useCallback(
    async (walletId: string, updates: Partial<Wallet>) => {
      // OPTIMISTIC UPDATE
      setWallets((prev) =>
        prev.map((w) => (w.id === walletId ? { ...w, ...updates } : w))
      );

      try {
        await dbRepository.updateWallet(walletId, updates);
        if (user) {
          await firestoreService.updateWallet(user.uid, walletId, updates);
        }
      } catch (err) {
        console.error('Failed to update wallet:', err);
      }
    },
    [user]
  );

  /**
   * 9. Kelola Dompet: Hapus Dompet
   */
  const deleteWallet = useCallback(
    async (walletId: string) => {
      // OPTIMISTIC UPDATE
      setWallets((prev) => prev.filter((w) => w.id !== walletId));

      try {
        await dbRepository.deleteWallet(walletId);
        if (user) {
          await firestoreService.deleteWallet(user.uid, walletId);
        }
      } catch (err) {
        console.error('Failed to delete wallet:', err);
      }
    },
    [user]
  );

  /**
   * 10. Nol-kan Seluruh Saldo Dompet Secara Instan & Paralel
   */
  const resetAllWalletBalances = useCallback(async () => {
    // OPTIMISTIC UPDATE
    setWallets((prev) => prev.map((w) => ({ ...w, balance: 0 })));

    try {
      await dbRepository.resetAllWalletBalances();
      if (user) {
        await firestoreService.resetAllWalletBalances(user.uid, wallets);
      }
    } catch (err) {
      console.error('Failed to reset wallet balances:', err);
    }
  }, [user, wallets]);

  /**
   * Tabungan & Hutang
   */
  const addSavingGoal = useCallback(async (goal: Omit<SavingGoal, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newGoal: SavingGoal = { ...goal, id: `sg_${Date.now()}`, updatedAt: now };
    setSavingGoals((prev) => [newGoal, ...prev]);
    await dbRepository.addSavingGoal(newGoal);
  }, []);

  const updateSavingGoalProgress = useCallback(async (id: string, addedAmount: number) => {
    setSavingGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + addedAmount) } : g))
    );
    await dbRepository.updateSavingGoalProgress(id, addedAmount);
  }, []);

  const deleteSavingGoal = useCallback(async (id: string) => {
    setSavingGoals((prev) => prev.filter((g) => g.id !== id));
    await dbRepository.deleteSavingGoal(id);
  }, []);

  const addDebt = useCallback(async (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDebt: Debt = { ...debt, id: `d_${Date.now()}`, createdAt: now, updatedAt: now };
    setDebts((prev) => [newDebt, ...prev]);
    await dbRepository.addDebt(newDebt);
  }, []);

  const settleDebt = useCallback(async (id: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSettled: true, remainingAmount: 0 } : d))
    );
    await dbRepository.settleDebt(id);
  }, []);

  const deleteDebt = useCallback(async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    await dbRepository.deleteDebt(id);
  }, []);

  return (
    <MoneyContext.Provider
      value={{
        loading,
        error,
        wallets,
        categories,
        transactions,
        currentMonthTransactions,
        savingGoals,
        debts,
        overview,
        budgetProgress,
        refresh: reloadData,
        addTransaction,
        deleteTransaction,
        updateCategoryBudget,
        updateCategory,
        deleteCategory,
        addCategory,
        updateWallet,
        addWallet,
        deleteWallet,
        resetAllWalletBalances,
        addSavingGoal,
        updateSavingGoalProgress,
        deleteSavingGoal,
        addDebt,
        settleDebt,
        deleteDebt,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return context;
}

