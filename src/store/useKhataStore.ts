import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '../types';

interface KhataStore {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  getTodayTransactions: () => Transaction[];
}

export const useKhataStore = create<KhataStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },

      updateTransaction: (id, tx) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...tx, id } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

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
    }),
    {
      name: 'khata-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);