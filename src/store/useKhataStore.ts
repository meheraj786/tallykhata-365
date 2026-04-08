import { create } from 'zustand';
import { Transaction } from '../types';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface KhataStore {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  getTodayTransactions: () => Transaction[];
}

export const useKhataStore = create<KhataStore>((set, get) => ({
  transactions: [],

  setTransactions: (txs) => set({ transactions: txs }),

addTransaction: async (tx) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  
  await addDoc(collection(db, 'users', userId, 'transactions'), {
    ...tx,
    createdAt: Date.now(),
  });
},

  updateTransaction: async (id, tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const docRef = doc(db, 'users', userId, 'transactions', id);
    await updateDoc(docRef, tx);
  },

  deleteTransaction: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const docRef = doc(db, 'users', userId, 'transactions', id);
    await deleteDoc(docRef);
  },

  getTotalIncome: () =>
    get().transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),

  getTotalExpense: () =>
    get().transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),

  getBalance: () => get().getTotalIncome() - get().getTotalExpense(),

  getTodayTransactions: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().transactions.filter((t) => t.date === today);
  },
}));