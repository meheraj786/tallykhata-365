import {
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  History,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useKhataStore } from "../store/useKhataStore";

interface Props {
  onAddClick: () => void;
}

export default function Home({ onAddClick }: Props) {
  const navigate = useNavigate();
  const { getBalance, getTodayTransactions, transactions } = useKhataStore();

  const balance = getBalance();
  const todayTx = getTodayTransactions();
  const recentTransactions = transactions.slice(0, 8);

  const todayIncome = todayTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpense = todayTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pb-28 md:pb-12">
        {/* Responsive Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              আমার<span className="text-emerald-600">খাতা</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar size={16} className="text-emerald-500" />
              <p className="text-sm font-semibold">
                আজ{" "}
                {new Date().toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onAddClick}
            className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            নতুন এন্ট্রি
          </button>

          {/* Mobile Add Button */}
          <button
            onClick={onAddClick}
            className="md:hidden w-12 h-12 bg-emerald-600 flex items-center justify-center rounded-2xl text-white shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </header>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stats & Balance (Sticky on Desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={120} />
              </div>

              <div className="relative z-10 space-y-6">
                <p className="text-emerald-100/80 font-bold uppercase tracking-widest text-xs">
                  বর্তমান ব্যালেন্স
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-light italic">৳</span>
                  <h2 className="text-5xl md:text-6xl font-bold text-white! tracking-tighter">
                    {balance.toLocaleString("bn-BD")}
                  </h2>
                </div>
                {/* <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-emerald-500 flex items-center justify-center backdrop-blur-sm">
                      <Wallet size={14} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-emerald-50">
                   
                  </span>
                </div> */}
              </div>
            </div>

            {/* Income/Expense Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                  <ArrowUpRight size={22} className="text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  আজকের আয়
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ৳ {todayIncome.toLocaleString("bn-BD")}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
                  <ArrowDownLeft size={22} className="text-rose-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  আজকের ব্যয়
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ৳ {todayExpense.toLocaleString("bn-BD")}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Transactions List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <History className="text-emerald-600" size={20} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  সাম্প্রতিক লেনদেন
                </h2>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="text-sm font-bold text-emerald-600 hover:underline decoration-2 underline-offset-4"
              >
                সবগুলো দেখুন
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                  এখনো কোনো এন্ট্রি নেই। একটি যোগ করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                          tx.type === "income"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownLeft size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {tx.category}
                        </h4>
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {tx.date} {tx.notes && <span>• {tx.notes}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold tracking-tight ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {tx.type === "income" ? "+" : "-"} ৳
                        {tx.amount.toLocaleString("bn-BD")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
