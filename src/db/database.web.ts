import { Category, Transaction, Wallet } from '@/types/money';

// Mock storage untuk Web browser
const memoryStorage = {
  wallets: [] as Wallet[],
  categories: [] as Category[],
  transactions: [] as Transaction[],
  savingGoals: [] as any[],
  debts: [] as any[],
};

function seedDefaultDataInMemory() {
  const now = new Date().toISOString();
  memoryStorage.wallets = [
    { id: 'w_cash', name: 'Uang Tunai', type: 'cash', balance: 500000, color: '#10B981', isDefault: true, updatedAt: now },
    { id: 'w_bank', name: 'Rekening Bank Utama', type: 'bank', balance: 4500000, color: '#3B82F6', isDefault: false, updatedAt: now },
    { id: 'w_ewallet', name: 'Dompet Digital', type: 'ewallet', balance: 350000, color: '#F59E0B', isDefault: false, updatedAt: now },
  ];
  memoryStorage.categories = [
    { id: 'c_food', name: 'Makanan & Minuman', type: 'expense', monthlyBudget: 1800000, color: '#EF4444', updatedAt: now },
    { id: 'c_transport', name: 'Transportasi', type: 'expense', monthlyBudget: 600000, color: '#F97316', updatedAt: now },
    { id: 'c_bills', name: 'Tagihan & Langganan', type: 'expense', monthlyBudget: 800000, color: '#8B5CF6', updatedAt: now },
    { id: 'c_shopping', name: 'Belanja & Pribadi', type: 'expense', monthlyBudget: 500000, color: '#EC4899', updatedAt: now },
    { id: 'c_salary', name: 'Gaji Pokok', type: 'income', monthlyBudget: 0, color: '#10B981', updatedAt: now },
    { id: 'c_side', name: 'Penghasilan Tambahan', type: 'income', monthlyBudget: 0, color: '#06B6D4', updatedAt: now },
  ];
  memoryStorage.transactions = [
    {
      id: 'tx_init_1',
      amount: 45000,
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      categoryId: 'c_food',
      walletId: 'w_cash',
      note: 'Makan Siang',
      createdAt: now,
      updatedAt: now,
      syncedToFirebase: false,
    },
    {
      id: 'tx_init_2',
      amount: 25000,
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      categoryId: 'c_transport',
      walletId: 'w_ewallet',
      note: 'Ongkos Transport',
      createdAt: now,
      updatedAt: now,
      syncedToFirebase: false,
    },
  ];
  memoryStorage.savingGoals = [
    {
      id: 'sg_1',
      name: 'Dana Darurat 3 Bulan',
      targetAmount: 15000000,
      currentAmount: 6500000,
      targetDate: '2026-12-31',
      color: '#10B981',
      icon: 'shield-checkmark',
      updatedAt: now,
    },
    {
      id: 'sg_2',
      name: 'Beli Laptop Kerja',
      targetAmount: 12000000,
      currentAmount: 4800000,
      targetDate: '2026-11-20',
      color: '#3B82F6',
      icon: 'laptop',
      updatedAt: now,
    },
  ];
  memoryStorage.debts = [
    {
      id: 'd_1',
      personName: 'Rian Pratama',
      amount: 350000,
      remainingAmount: 350000,
      type: 'receivable',
      dueDate: '2026-11-05',
      note: 'Talangan beli tiket kereta',
      isSettled: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd_2',
      personName: 'Dimas Kurnia',
      amount: 200000,
      remainingAmount: 0,
      type: 'debt',
      dueDate: '2026-10-25',
      note: 'Patungan kado ultah',
      isSettled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export async function initDatabase(): Promise<void> {
  if (memoryStorage.wallets.length === 0) {
    seedDefaultDataInMemory();
  }
}

export const dbRepository = {
  async getWallets(): Promise<Wallet[]> {
    if (memoryStorage.wallets.length === 0) seedDefaultDataInMemory();
    return [...memoryStorage.wallets];
  },

  async addWallet(wallet: Omit<Wallet, 'updatedAt'>): Promise<Wallet> {
    const updatedAt = new Date().toISOString();
    const item: Wallet = { ...wallet, updatedAt };
    memoryStorage.wallets.push(item);
    return item;
  },

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    const updatedAt = new Date().toISOString();
    const idx = memoryStorage.wallets.findIndex((w) => w.id === id);
    if (idx !== -1) {
      memoryStorage.wallets[idx] = { ...memoryStorage.wallets[idx], ...updates, updatedAt };
    }
  },

  async getCategories(): Promise<Category[]> {
    if (memoryStorage.categories.length === 0) seedDefaultDataInMemory();
    return [...memoryStorage.categories];
  },

  async addCategory(cat: Omit<Category, 'updatedAt'>): Promise<Category> {
    const updatedAt = new Date().toISOString();
    const item: Category = { ...cat, updatedAt };
    memoryStorage.categories.push(item);
    return item;
  },

  async updateCategoryBudget(categoryId: string, monthlyBudget: number): Promise<void> {
    const updatedAt = new Date().toISOString();
    const idx = memoryStorage.categories.findIndex((c) => c.id === categoryId);
    if (idx !== -1) {
      memoryStorage.categories[idx].monthlyBudget = monthlyBudget;
      memoryStorage.categories[idx].updatedAt = updatedAt;
    }
  },

  async getTransactions(limit = 100): Promise<Transaction[]> {
    if (memoryStorage.transactions.length === 0) seedDefaultDataInMemory();
    return [...memoryStorage.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  },

  async addTransaction(tx: Omit<Transaction, 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const item: Transaction = { ...tx, createdAt: now, updatedAt: now };
    memoryStorage.transactions.unshift(item);

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
  },

  async deleteTransaction(id: string): Promise<void> {
    const idx = memoryStorage.transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const item = memoryStorage.transactions[idx];
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
  },

  async getSavingGoals(): Promise<any[]> {
    if (memoryStorage.savingGoals.length === 0) seedDefaultDataInMemory();
    return [...memoryStorage.savingGoals];
  },

  async addSavingGoal(goal: any): Promise<void> {
    memoryStorage.savingGoals.unshift(goal);
  },

  async updateSavingGoalProgress(id: string, addedAmount: number): Promise<void> {
    const now = new Date().toISOString();
    const g = memoryStorage.savingGoals.find((x) => x.id === id);
    if (g) {
      g.currentAmount = Math.max(0, g.currentAmount + addedAmount);
      g.updatedAt = now;
    }
  },

  async deleteSavingGoal(id: string): Promise<void> {
    memoryStorage.savingGoals = memoryStorage.savingGoals.filter((x) => x.id !== id);
  },

  async getDebts(): Promise<any[]> {
    if (memoryStorage.debts.length === 0) seedDefaultDataInMemory();
    return [...memoryStorage.debts];
  },

  async addDebt(debt: any): Promise<void> {
    memoryStorage.debts.unshift(debt);
  },

  async settleDebt(id: string): Promise<void> {
    const now = new Date().toISOString();
    const d = memoryStorage.debts.find((x) => x.id === id);
    if (d) {
      d.isSettled = true;
      d.remainingAmount = 0;
      d.updatedAt = now;
    }
  },

  async deleteDebt(id: string): Promise<void> {
    memoryStorage.debts = memoryStorage.debts.filter((x) => x.id !== id);
  },
};
