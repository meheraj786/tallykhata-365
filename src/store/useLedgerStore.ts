import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  // updateDoc, 
  deleteDoc, 
  doc, 
  increment, 
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface LedgerEntry {
  id: string;
  amount: number;
  type: 'gave' | 'received'; 
  date: string;
  time: string;
  note: string;
  customerName?: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDue: number; 
  updatedAt: number;
}

interface LedgerState {
  customers: Customer[];
  activeLedger: LedgerEntry[];
  allTransactions: LedgerEntry[];
  setCustomers: (customers: Customer[]) => void;
  setActiveLedger: (entries: LedgerEntry[]) => void;
  setAllTransactions: (entries: LedgerEntry[]) => void;
  addCustomer: (name: string, phone: string) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addLedgerEntry: (customerId: string, customerName: string, entry: Omit<LedgerEntry, 'id' | 'createdAt' | 'time' | 'customerName'>) => Promise<void>;
  updateLedgerEntry: (customerId: string, entryId: string, oldEntry: LedgerEntry, newData: Partial<LedgerEntry>) => Promise<void>;
  deleteLedgerEntry: (customerId: string, entryId: string, amount: number, type: 'gave' | 'received') => Promise<void>;
  getTotalReceivable: () => number;
  getTotalPayable: () => number;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  customers: [],
  activeLedger: [],
  allTransactions: [],

  setCustomers: (customers) => set({ customers }),
  setActiveLedger: (entries) => set({ activeLedger: entries }),
  setAllTransactions: (entries) => set({ allTransactions: entries }),

  addCustomer: async (name, phone) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'customers'), {
      name, phone, totalDue: 0, updatedAt: Date.now(),
    });
  },

  deleteCustomer: async (customerId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'customers', customerId));
  },

  addLedgerEntry: async (customerId, customerName, entryData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const batch = writeBatch(db);
    const ledgerRef = collection(db, 'users', userId, 'customers', customerId, 'ledger');
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newEntry = { ...entryData, customerName, time: currentTime, createdAt: Date.now() };
    const balanceChange = entryData.type === 'gave' ? entryData.amount : -entryData.amount;
    const newDocRef = doc(ledgerRef);
    batch.set(newDocRef, newEntry);
    batch.update(doc(db, 'users', userId, 'customers', customerId), {
      totalDue: increment(balanceChange),
      updatedAt: Date.now()
    });
    await batch.commit();
  },

  updateLedgerEntry: async (customerId, entryId, oldEntry, newData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const batch = writeBatch(db);
    const entryRef = doc(db, 'users', userId, 'customers', customerId, 'ledger', entryId);
    const oldEffect = oldEntry.type === 'gave' ? -oldEntry.amount : oldEntry.amount;
    const newEffect = newData.type === 'gave' ? (newData.amount || 0) : -(newData.amount || 0);
    const totalChange = oldEffect + newEffect;
    batch.update(entryRef, { ...newData });
    batch.update(doc(db, 'users', userId, 'customers', customerId), {
      totalDue: increment(totalChange),
      updatedAt: Date.now()
    });
    await batch.commit();
  },

  deleteLedgerEntry: async (customerId, entryId, amount, type) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const batch = writeBatch(db);
    const balanceReverse = type === 'gave' ? -amount : amount;
    batch.delete(doc(db, 'users', userId, 'customers', customerId, 'ledger', entryId));
    batch.update(doc(db, 'users', userId, 'customers', customerId), {
      totalDue: increment(balanceReverse),
      updatedAt: Date.now()
    });
    await batch.commit();
  },

  getTotalReceivable: () => get().customers.filter(c => c.totalDue > 0).reduce((sum, c) => sum + c.totalDue, 0),
  getTotalPayable: () => Math.abs(get().customers.filter(c => c.totalDue < 0).reduce((sum, c) => sum + c.totalDue, 0)),
}));