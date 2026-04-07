export type Transaction = {
  id: string;
  date: string; 
  type: 'income' | 'expense';
  amount: number;
  category: string;
  notes?: string;
};

export const popularCategories = {
  income: ['বেতন', 'ব্যবসা', 'ফ্রিল্যান্স', 'বোনাস', 'অন্যান্য'],
  expense: ['খাবার', 'যাতায়াত', 'ভাড়া', 'বিল', 'রিচার্জ', 'কেনাকাটা', 'চিকিৎসা', 'শিক্ষা', 'অন্যান্য']
};