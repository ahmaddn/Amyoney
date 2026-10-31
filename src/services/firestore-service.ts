import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Category, Transaction, Wallet } from '@/types/money';
import { EXPANDED_DEFAULT_EXPENSES, EXPANDED_DEFAULT_INCOMES } from '@/constants/default-categories';

export const firestoreService = {
  // Listener Realtime Wallets
  subscribeWallets(uid: string, onUpdate: (wallets: Wallet[]) => void) {
    const colRef = collection(firestore, `users/${uid}/wallets`);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Wallet);
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore wallets listener error:', error.message);
      }
    );
  },

  // Listener Realtime Categories
  subscribeCategories(uid: string, onUpdate: (categories: Category[]) => void) {
    const colRef = collection(firestore, `users/${uid}/categories`);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Category);
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore categories listener error:', error.message);
      }
    );
  },

  // Listener Realtime Transactions
  subscribeTransactions(uid: string, onUpdate: (transactions: Transaction[]) => void) {
    const colRef = collection(firestore, `users/${uid}/transactions`);
    const q = query(colRef, orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as Transaction);
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore transactions listener error:', error.message);
      }
    );
  },

  // Inisialisasi data awal akun baru di Firestore
  async seedInitialUserData(uid: string) {
    const now = new Date().toISOString();
    const batch = writeBatch(firestore);

    const defaultWallets: Wallet[] = [
      { id: 'w_cash', name: 'Uang Tunai', type: 'cash', balance: 0, color: '#10B981', isDefault: true, updatedAt: now },
      { id: 'w_bank', name: 'Rekening Bank', type: 'bank', balance: 0, color: '#3B82F6', isDefault: false, updatedAt: now },
      { id: 'w_ewallet', name: 'Dompet Digital', type: 'ewallet', balance: 0, color: '#F59E0B', isDefault: false, updatedAt: now },
    ];

    for (const w of defaultWallets) {
      batch.set(doc(collection(firestore, `users/${uid}/wallets`), w.id), w);
    }

    EXPANDED_DEFAULT_EXPENSES.forEach((def, idx) => {
      const c: Category = {
        id: `c_exp_${idx + 1}`,
        name: def.name,
        type: 'expense',
        icon: def.icon,
        color: def.color,
        monthlyBudget: def.defaultBudget || 0,
        updatedAt: now,
      };
      batch.set(doc(collection(firestore, `users/${uid}/categories`), c.id), c);
    });

    EXPANDED_DEFAULT_INCOMES.forEach((def, idx) => {
      const c: Category = {
        id: `c_inc_${idx + 1}`,
        name: def.name,
        type: 'income',
        icon: def.icon,
        color: def.color,
        monthlyBudget: 0,
        updatedAt: now,
      };
      batch.set(doc(collection(firestore, `users/${uid}/categories`), c.id), c);
    });

    await batch.commit();
  },

  // Tambah kategori kustom
  async addCategory(uid: string, category: Category) {
    const cRef = doc(collection(firestore, `users/${uid}/categories`), category.id);
    await setDoc(cRef, category);
  },

  // Reset saldo seluruh dompet ke 0
  async resetAllWalletBalances(uid: string, wallets: Wallet[]) {
    const batch = writeBatch(firestore);
    const now = new Date().toISOString();
    for (const w of wallets) {
      const wRef = doc(collection(firestore, `users/${uid}/wallets`), w.id);
      batch.update(wRef, { balance: 0, updatedAt: now });
    }
    await batch.commit();
  },

  // Simpan transaksi baru dan sesuaikan saldo dompet
  async addTransaction(uid: string, tx: Transaction, wallets: Wallet[]) {
    const batch = writeBatch(firestore);
    const txRef = doc(collection(firestore, `users/${uid}/transactions`), tx.id);
    batch.set(txRef, tx);

    const now = new Date().toISOString();
    if (tx.type === 'expense') {
      const w = wallets.find((x) => x.id === tx.walletId);
      if (w) {
        const wRef = doc(collection(firestore, `users/${uid}/wallets`), w.id);
        batch.update(wRef, { balance: w.balance - tx.amount, updatedAt: now });
      }
    } else if (tx.type === 'income') {
      const w = wallets.find((x) => x.id === tx.walletId);
      if (w) {
        const wRef = doc(collection(firestore, `users/${uid}/wallets`), w.id);
        batch.update(wRef, { balance: w.balance + tx.amount, updatedAt: now });
      }
    } else if (tx.type === 'transfer' && tx.toWalletId) {
      const fromW = wallets.find((x) => x.id === tx.walletId);
      const toW = wallets.find((x) => x.id === tx.toWalletId);
      if (fromW) {
        const fromRef = doc(collection(firestore, `users/${uid}/wallets`), fromW.id);
        batch.update(fromRef, { balance: fromW.balance - tx.amount, updatedAt: now });
      }
      if (toW) {
        const toRef = doc(collection(firestore, `users/${uid}/wallets`), toW.id);
        batch.update(toRef, { balance: toW.balance + tx.amount, updatedAt: now });
      }
    }

    await batch.commit();
  },

  // Hapus transaksi dan kembalikan saldo dompet
  async deleteTransaction(uid: string, tx: Transaction, wallets: Wallet[]) {
    const batch = writeBatch(firestore);
    const txRef = doc(collection(firestore, `users/${uid}/transactions`), tx.id);
    batch.delete(txRef);

    const now = new Date().toISOString();
    if (tx.type === 'expense') {
      const w = wallets.find((x) => x.id === tx.walletId);
      if (w) {
        const wRef = doc(collection(firestore, `users/${uid}/wallets`), w.id);
        batch.update(wRef, { balance: w.balance + tx.amount, updatedAt: now });
      }
    } else if (tx.type === 'income') {
      const w = wallets.find((x) => x.id === tx.walletId);
      if (w) {
        const wRef = doc(collection(firestore, `users/${uid}/wallets`), w.id);
        batch.update(wRef, { balance: w.balance - tx.amount, updatedAt: now });
      }
    } else if (tx.type === 'transfer' && tx.toWalletId) {
      const fromW = wallets.find((x) => x.id === tx.walletId);
      const toW = wallets.find((x) => x.id === tx.toWalletId);
      if (fromW) {
        const fromRef = doc(collection(firestore, `users/${uid}/wallets`), fromW.id);
        batch.update(fromRef, { balance: fromW.balance + tx.amount, updatedAt: now });
      }
      if (toW) {
        const toRef = doc(collection(firestore, `users/${uid}/wallets`), toW.id);
        batch.update(toRef, { balance: toW.balance - tx.amount, updatedAt: now });
      }
    }

    await batch.commit();
  },

  // Update data dompet (nama, saldo, warna, isActive)
  async updateWallet(uid: string, walletId: string, updates: Partial<Wallet>) {
    const wRef = doc(collection(firestore, `users/${uid}/wallets`), walletId);
    await setDoc(wRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // Tambah dompet baru
  async addWallet(uid: string, wallet: Wallet) {
    const wRef = doc(collection(firestore, `users/${uid}/wallets`), wallet.id);
    await setDoc(wRef, wallet);
  },

  // Hapus dompet
  async deleteWallet(uid: string, walletId: string) {
    const wRef = doc(collection(firestore, `users/${uid}/wallets`), walletId);
    await deleteDoc(wRef);
  },

  // Hapus kategori
  async deleteCategory(uid: string, categoryId: string) {
    const cRef = doc(collection(firestore, `users/${uid}/categories`), categoryId);
    await deleteDoc(cRef);
  },

  // Update target pagu bulanan kategori
  async updateCategoryBudget(uid: string, categoryId: string, monthlyBudget: number) {
    const cRef = doc(collection(firestore, `users/${uid}/categories`), categoryId);
    await setDoc(cRef, { monthlyBudget, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // Update data kategori (nama, ikon, warna, budget)
  async updateCategory(uid: string, categoryId: string, updates: Partial<Category>) {
    const cRef = doc(collection(firestore, `users/${uid}/categories`), categoryId);
    await setDoc(cRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  },
};
