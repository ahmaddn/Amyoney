import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Category, Transaction, Wallet } from '@/types/money';
import { EXPANDED_DEFAULT_EXPENSES, EXPANDED_DEFAULT_INCOMES } from '@/constants/default-categories';

const DB_NAME = 'amyoney.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

// Mock storage untuk web jika expo-sqlite web fallback diperlukan
const memoryStorage = {
  wallets: [] as Wallet[],
  categories: [] as Category[],
  transactions: [] as Transaction[],
  savingGoals: [] as any[],
  debts: [] as any[],
};

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  if (!db) {
    // Inisialisasi mock storage di web jika browser
    if (memoryStorage.wallets.length === 0) {
      seedDefaultDataInMemory();
    }
    return;
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      color TEXT,
      isDefault INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      monthlyBudget REAL NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      categoryId TEXT,
      walletId TEXT NOT NULL,
      toWalletId TEXT,
      note TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncedToFirebase INTEGER DEFAULT 0,
      FOREIGN KEY (walletId) REFERENCES wallets (id),
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS saving_goals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      currentAmount REAL NOT NULL DEFAULT 0,
      targetDate TEXT,
      color TEXT,
      icon TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY NOT NULL,
      personName TEXT NOT NULL,
      amount REAL NOT NULL,
      remainingAmount REAL NOT NULL,
      type TEXT NOT NULL,
      dueDate TEXT,
      note TEXT,
      isSettled INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Cek apakah data awal sudah ada
  const walletCheck = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM wallets;');
  if (!walletCheck || walletCheck.count === 0) {
    await seedDefaultData(db);
  }
}

function seedDefaultDataInMemory() {
  const now = new Date().toISOString();
  memoryStorage.wallets = [
    { id: 'w_cash', name: 'Uang Tunai', type: 'cash', balance: 0, color: '#10B981', isDefault: true, updatedAt: now },
    { id: 'w_bank', name: 'Rekening Bank Utama', type: 'bank', balance: 0, color: '#3B82F6', isDefault: false, updatedAt: now },
    { id: 'w_ewallet', name: 'Dompet Digital', type: 'ewallet', balance: 0, color: '#F59E0B', isDefault: false, updatedAt: now },
  ];

  const cats: Category[] = [];
  EXPANDED_DEFAULT_EXPENSES.forEach((def, idx) => {
    cats.push({
      id: `c_exp_${idx + 1}`,
      name: def.name,
      type: 'expense',
      icon: def.icon,
      color: def.color,
      monthlyBudget: def.defaultBudget || 0,
      updatedAt: now,
    });
  });
  EXPANDED_DEFAULT_INCOMES.forEach((def, idx) => {
    cats.push({
      id: `c_inc_${idx + 1}`,
      name: def.name,
      type: 'income',
      icon: def.icon,
      color: def.color,
      monthlyBudget: 0,
      updatedAt: now,
    });
  });
  memoryStorage.categories = cats;
  memoryStorage.transactions = [];
  memoryStorage.savingGoals = [];
  memoryStorage.debts = [];
}

async function seedDefaultData(db: SQLite.SQLiteDatabase) {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO wallets (id, name, type, balance, color, isDefault, updatedAt) VALUES
        ('w_cash', 'Uang Tunai', 'cash', 0, '#10B981', 1, ?),
        ('w_bank', 'Rekening Bank Utama', 'bank', 0, '#3B82F6', 0, ?),
        ('w_ewallet', 'Dompet Digital', 'ewallet', 0, '#F59E0B', 0, ?);`,
      [now, now, now]
    );

    for (let i = 0; i < EXPANDED_DEFAULT_EXPENSES.length; i++) {
      const def = EXPANDED_DEFAULT_EXPENSES[i];
      await db.runAsync(
        'INSERT INTO categories (id, name, type, icon, color, monthlyBudget, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`c_exp_${i + 1}`, def.name, 'expense', def.icon, def.color, def.defaultBudget || 0, now]
      );
    }

    for (let i = 0; i < EXPANDED_DEFAULT_INCOMES.length; i++) {
      const def = EXPANDED_DEFAULT_INCOMES[i];
      await db.runAsync(
        'INSERT INTO categories (id, name, type, icon, color, monthlyBudget, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`c_inc_${i + 1}`, def.name, 'income', def.icon, def.color, 0, now]
      );
    }
  });
}

// Repository Operasi
export const dbRepository = {
  // Wallets
  async getWallets(): Promise<Wallet[]> {
    const db = await getDatabase();
    if (!db) return [...memoryStorage.wallets];
    try {
      await db.execAsync('ALTER TABLE wallets ADD COLUMN isActive INTEGER DEFAULT 1;');
    } catch {}
    const rows = await db.getAllAsync<any>('SELECT * FROM wallets ORDER BY isDefault DESC, name ASC;');
    return rows.map((r) => ({
      ...r,
      isDefault: Boolean(r.isDefault),
      isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
    }));
  },

  async addWallet(wallet: Omit<Wallet, 'updatedAt'>): Promise<Wallet> {
    const updatedAt = new Date().toISOString();
    const item: Wallet = { ...wallet, updatedAt };
    const db = await getDatabase();
    if (!db) {
      memoryStorage.wallets.push(item);
      return item;
    }
    await db.runAsync(
      'INSERT INTO wallets (id, name, type, balance, color, isDefault, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.type, item.balance, item.color || null, item.isDefault ? 1 : 0, item.updatedAt]
    );
    return item;
  },

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    const updatedAt = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const idx = memoryStorage.wallets.findIndex((w) => w.id === id);
      if (idx !== -1) {
        memoryStorage.wallets[idx] = { ...memoryStorage.wallets[idx], ...updates, updatedAt };
      }
      return;
    }
    const current = await db.getFirstAsync<any>('SELECT * FROM wallets WHERE id = ?', [id]);
    if (!current) return;
    const merged = { ...current, ...updates, updatedAt };
    await db.runAsync(
      'UPDATE wallets SET name = ?, type = ?, balance = ?, color = ?, isDefault = ?, updatedAt = ? WHERE id = ?',
      [merged.name, merged.type, merged.balance, merged.color, merged.isDefault ? 1 : 0, merged.updatedAt, id]
    );
  },

  async deleteWallet(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.wallets = memoryStorage.wallets.filter((w) => w.id !== id);
      return;
    }
    await db.runAsync('DELETE FROM wallets WHERE id = ?;', [id]);
  },

  async resetAllWalletBalances(): Promise<void> {
    const updatedAt = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      memoryStorage.wallets.forEach((w) => {
        w.balance = 0;
        w.updatedAt = updatedAt;
      });
      return;
    }
    await db.runAsync('UPDATE wallets SET balance = 0, updatedAt = ?;', [updatedAt]);
  },

  // Categories & Budgets
  async getCategories(): Promise<Category[]> {
    const db = await getDatabase();
    if (!db) return [...memoryStorage.categories];
    return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC;');
  },

  async addCategory(cat: Omit<Category, 'updatedAt'>): Promise<Category> {
    const updatedAt = new Date().toISOString();
    const item: Category = { ...cat, updatedAt };
    const db = await getDatabase();
    if (!db) {
      memoryStorage.categories.push(item);
      return item;
    }
    await db.runAsync(
      'INSERT INTO categories (id, name, type, icon, color, monthlyBudget, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.type, item.icon || null, item.color || null, item.monthlyBudget, item.updatedAt]
    );
    return item;
  },

  async updateCategoryBudget(categoryId: string, monthlyBudget: number): Promise<void> {
    const updatedAt = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const idx = memoryStorage.categories.findIndex((c) => c.id === categoryId);
      if (idx !== -1) {
        memoryStorage.categories[idx].monthlyBudget = monthlyBudget;
        memoryStorage.categories[idx].updatedAt = updatedAt;
      }
      return;
    }
    await db.runAsync('UPDATE categories SET monthlyBudget = ?, updatedAt = ? WHERE id = ?', [
      monthlyBudget,
      updatedAt,
      categoryId,
    ]);
  },

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    const updatedAt = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const idx = memoryStorage.categories.findIndex((c) => c.id === categoryId);
      if (idx !== -1) {
        memoryStorage.categories[idx] = { ...memoryStorage.categories[idx], ...updates, updatedAt };
      }
      return;
    }
    const current = await db.getFirstAsync<any>('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (!current) return;
    const merged = { ...current, ...updates, updatedAt };
    await db.runAsync(
      'UPDATE categories SET name = ?, type = ?, icon = ?, color = ?, monthlyBudget = ?, updatedAt = ? WHERE id = ?',
      [merged.name, merged.type, merged.icon, merged.color, merged.monthlyBudget, merged.updatedAt, categoryId]
    );
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.categories = memoryStorage.categories.filter((c) => c.id !== categoryId);
      return;
    }
    await db.runAsync('DELETE FROM categories WHERE id = ?;', [categoryId]);
  },

  // Transactions
  async getTransactions(limit = 100): Promise<Transaction[]> {
    const db = await getDatabase();
    if (!db) {
      return [...memoryStorage.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    }
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC LIMIT ?;',
      [limit]
    );
    return rows.map((r) => ({ ...r, syncedToFirebase: Boolean(r.syncedToFirebase) }));
  },

  async addTransaction(tx: Omit<Transaction, 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const item: Transaction = { ...tx, createdAt: now, updatedAt: now };
    const db = await getDatabase();

    if (!db) {
      memoryStorage.transactions.unshift(item);
      // Update saldo dompet in-memory
      if (item.type === 'expense') {
        const w = memoryStorage.wallets.find((x) => x.id === item.walletId);
        if (w) w.balance -= item.amount;
      } else if (item.type === 'income') {
        const w = memoryStorage.wallets.find((x) => x.id === item.walletId);
        if (w) w.balance += item.amount;
      } else if (item.type === 'transfer' && item.toWalletId) {
        const fromW = memoryStorage.wallets.find((x) => x.id === item.walletId);
        const toW = memoryStorage.wallets.find((x) => x.id === item.toWalletId);
        if (fromW) fromW.balance -= item.amount;
        if (toW) toW.balance += item.amount;
      }
      return item;
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO transactions (id, amount, type, date, categoryId, walletId, toWalletId, note, createdAt, updatedAt, syncedToFirebase)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id,
          item.amount,
          item.type,
          item.date,
          item.categoryId || null,
          item.walletId,
          item.toWalletId || null,
          item.note || null,
          item.createdAt,
          item.updatedAt,
          item.syncedToFirebase ? 1 : 0,
        ]
      );

      // Mutasi saldo
      if (item.type === 'expense') {
        await db.runAsync('UPDATE wallets SET balance = balance - ?, updatedAt = ? WHERE id = ?;', [
          item.amount,
          now,
          item.walletId,
        ]);
      } else if (item.type === 'income') {
        await db.runAsync('UPDATE wallets SET balance = balance + ?, updatedAt = ? WHERE id = ?;', [
          item.amount,
          now,
          item.walletId,
        ]);
      } else if (item.type === 'transfer' && item.toWalletId) {
        await db.runAsync('UPDATE wallets SET balance = balance - ?, updatedAt = ? WHERE id = ?;', [
          item.amount,
          now,
          item.walletId,
        ]);
        await db.runAsync('UPDATE wallets SET balance = balance + ?, updatedAt = ? WHERE id = ?;', [
          item.amount,
          now,
          item.toWalletId,
        ]);
      }
    });

    return item;
  },

  async deleteTransaction(id: string): Promise<void> {
    const now = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const idx = memoryStorage.transactions.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const item = memoryStorage.transactions[idx];
        // Balikkan saldo
        if (item.type === 'expense') {
          const w = memoryStorage.wallets.find((x) => x.id === item.walletId);
          if (w) w.balance += item.amount;
        } else if (item.type === 'income') {
          const w = memoryStorage.wallets.find((x) => x.id === item.walletId);
          if (w) w.balance -= item.amount;
        } else if (item.type === 'transfer' && item.toWalletId) {
          const fromW = memoryStorage.wallets.find((x) => x.id === item.walletId);
          const toW = memoryStorage.wallets.find((x) => x.id === item.toWalletId);
          if (fromW) fromW.balance += item.amount;
          if (toW) toW.balance -= item.amount;
        }
        memoryStorage.transactions.splice(idx, 1);
      }
      return;
    }

    const tx = await db.getFirstAsync<any>('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!tx) return;

    await db.withTransactionAsync(async () => {
      // Revert saldo dompet
      if (tx.type === 'expense') {
        await db.runAsync('UPDATE wallets SET balance = balance + ?, updatedAt = ? WHERE id = ?;', [
          tx.amount,
          now,
          tx.walletId,
        ]);
      } else if (tx.type === 'income') {
        await db.runAsync('UPDATE wallets SET balance = balance - ?, updatedAt = ? WHERE id = ?;', [
          tx.amount,
          now,
          tx.walletId,
        ]);
      } else if (tx.type === 'transfer' && tx.toWalletId) {
        await db.runAsync('UPDATE wallets SET balance = balance + ?, updatedAt = ? WHERE id = ?;', [
          tx.amount,
          now,
          tx.walletId,
        ]);
        await db.runAsync('UPDATE wallets SET balance = balance - ?, updatedAt = ? WHERE id = ?;', [
          tx.amount,
          now,
          tx.toWalletId,
        ]);
      }

      await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
    });
  },

  async getSavingGoals(): Promise<any[]> {
    const db = await getDatabase();
    if (!db) return memoryStorage.savingGoals;
    return await db.getAllAsync<any>('SELECT * FROM saving_goals ORDER BY updatedAt DESC;');
  },

  async addSavingGoal(goal: any): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.savingGoals.unshift(goal);
      return;
    }
    await db.runAsync(
      `INSERT INTO saving_goals (id, name, targetAmount, currentAmount, targetDate, color, icon, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [goal.id, goal.name, goal.targetAmount, goal.currentAmount || 0, goal.targetDate || null, goal.color || '#10B981', goal.icon || 'star', goal.updatedAt]
    );
  },

  async updateSavingGoalProgress(id: string, addedAmount: number): Promise<void> {
    const now = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const g = memoryStorage.savingGoals.find((x) => x.id === id);
      if (g) {
        g.currentAmount = Math.max(0, g.currentAmount + addedAmount);
        g.updatedAt = now;
      }
      return;
    }
    await db.runAsync('UPDATE saving_goals SET currentAmount = MAX(0, currentAmount + ?), updatedAt = ? WHERE id = ?;', [
      addedAmount,
      now,
      id,
    ]);
  },

  async deleteSavingGoal(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.savingGoals = memoryStorage.savingGoals.filter((x) => x.id !== id);
      return;
    }
    await db.runAsync('DELETE FROM saving_goals WHERE id = ?;', [id]);
  },

  async getDebts(): Promise<any[]> {
    const db = await getDatabase();
    if (!db) return memoryStorage.debts;
    const rows = await db.getAllAsync<any>('SELECT * FROM debts ORDER BY isSettled ASC, dueDate ASC;');
    return rows.map((r) => ({ ...r, isSettled: Boolean(r.isSettled) }));
  },

  async addDebt(debt: any): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.debts.unshift(debt);
      return;
    }
    await db.runAsync(
      `INSERT INTO debts (id, personName, amount, remainingAmount, type, dueDate, note, isSettled, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        debt.id,
        debt.personName,
        debt.amount,
        debt.remainingAmount,
        debt.type,
        debt.dueDate || null,
        debt.note || null,
        debt.isSettled ? 1 : 0,
        debt.createdAt,
        debt.updatedAt,
      ]
    );
  },

  async settleDebt(id: string): Promise<void> {
    const now = new Date().toISOString();
    const db = await getDatabase();
    if (!db) {
      const d = memoryStorage.debts.find((x) => x.id === id);
      if (d) {
        d.isSettled = true;
        d.remainingAmount = 0;
        d.updatedAt = now;
      }
      return;
    }
    await db.runAsync('UPDATE debts SET isSettled = 1, remainingAmount = 0, updatedAt = ? WHERE id = ?;', [now, id]);
  },

  async deleteDebt(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) {
      memoryStorage.debts = memoryStorage.debts.filter((x) => x.id !== id);
      return;
    }
    await db.runAsync('DELETE FROM debts WHERE id = ?;', [id]);
  },
};
