import { useState } from "react";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Filter,
  AlertCircle,
  X,
  Calendar,
  Edit2,
  Tag,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } =
    useKhataStore();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    date: "",
    type: "expense" as "income" | "expense",
    amount: 0,
    category: "",
    notes: "",
    createdAt: 0,
  });

  const availableYears = [
    "all",
    ...Array.from(
      new Set(transactions.map((tx) => new Date(tx.date).getFullYear())),
    ).sort((a, b) => b - a),
  ];

  const filteredTx = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      if (selectedDate) return tx.date === selectedDate;
      if (selectedMonth !== "all" && selectedYear !== "all") {
        return (
          txDate.getFullYear() === parseInt(selectedYear) &&
          txDate.getMonth() + 1 === parseInt(selectedMonth)
        );
      }
      if (selectedYear !== "all")
        return txDate.getFullYear() === parseInt(selectedYear);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleEditClick = (tx: (typeof filteredTx)[0]) => {
    setEditingTx(tx.id);
    setEditData({
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      notes: tx.notes || "",
      createdAt: tx.createdAt,
    });
  };

  const handleSaveEdit = () => {
    if (editingTx && editData.category && editData.amount > 0) {
      updateTransaction(editingTx, {
        date: editData.date,
        type: editData.type,
        amount: editData.amount,
        category: editData.category,
        notes: editData.notes,
        createdAt: editData?.createdAt || Date.now(),
      });
      setEditingTx(null);
    }
  };

  const groupedTx = filteredTx.reduce(
    (groups, tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
      return groups;
    },
    {} as Record<string, typeof filteredTx>,
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-12 pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              সব <span className="text-emerald-600">লেনদেন</span>
            </h1>
            <p className="text-slate-500 font-semibold flex items-center justify-center md:justify-start gap-2 italic">
              <Filter size={18} className="text-emerald-500" />
              আপনার জমানো সব হিসাবের তালিকা
            </p>
          </div>

          {/* Clear Filter Button */}
          {(selectedYear !== "all" ||
            selectedMonth !== "all" ||
            selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedDate("");
              }}
              className="rounded-full px-6 border-rose-200 text-rose-500 font-bold bg-rose-50/50 hover:bg-rose-50"
            >
              ফিল্টার রিসেট <X size={14} className="ml-2" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Filters & Summary */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            {/* Filter Card */}
            <div className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-[2.5rem] space-y-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-emerald-600" />
                ফিল্টার করুন
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      বছর
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-emerald-500/20 cursor-pointer appearance-none"
                    >
                      <option value="all">সব বছর</option>
                      {availableYears.slice(1).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      মাস
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-emerald-500/20 cursor-pointer appearance-none"
                    >
                      <option value="all">সব মাস</option>
                      {[
                        "জানুয়ারি",
                        "ফেব্রুয়ারি",
                        "মার্চ",
                        "এপ্রিল",
                        "মে",
                        "জুন",
                        "জুলাই",
                        "আগস্ট",
                        "সেপ্টেম্বর",
                        "অক্টোবর",
                        "নভেম্বর",
                        "ডিসেম্বর",
                      ].map((m, i) => (
                        <option key={i} value={String(i + 1).padStart(2, "0")}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    নির্দিষ্ট তারিখ
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-2xl bg-slate-50 border-none h-14 font-bold px-4"
                  />
                </div>
              </div>
            </div>

            {/* Summary List Card */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-slate-200">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  ফিল্টার সামারি
                </span>
                <Wallet size={18} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">
                    মোট আয়
                  </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    ৳{totalIncome.toLocaleString("bn-BD")}
                  </span>
                </div>
                <div className="flex justify-between items-center border-y border-white/5 py-4">
                  <span className="text-sm font-bold text-slate-400">
                    মোট ব্যয়
                  </span>
                  <span className="text-rose-400 font-bold text-lg">
                    ৳{totalExpense.toLocaleString("bn-BD")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-400">
                    নেট ব্যালেন্স
                  </span>
                  <span
                    className={`font-bold text-2xl ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    ৳{balance.toLocaleString("bn-BD")}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Transactions List */}
          <div className="lg:col-span-8 space-y-10">
            {Object.keys(groupedTx).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-900 font-bold text-xl">
                  কোনো লেনদেন পাওয়া যায়নি
                </p>
                <p className="text-sm text-slate-400 font-semibold mt-2 px-6">
                  আপনার নির্বাচিত ফিল্টার অনুযায়ী কোনো ডেটা নেই। অন্য তারিখ
                  ট্রাই করুন।
                </p>
              </div>
            ) : (
              Object.entries(groupedTx)
                .sort(
                  ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
                )
                .map(([date, txs]) => {
                  const dailyIncome = txs
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const dailyExpense = txs
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div key={date} className="space-y-5">
                      {/* Date Header Sticky */}
                      <div className="sticky top-6 z-10 flex justify-between items-center bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white leading-none shadow-lg shadow-emerald-100">
                            <span className="text-[10px] font-bold uppercase mb-1">
                              {new Date(date).toLocaleDateString("bn-BD", {
                                month: "short",
                              })}
                            </span>
                            <span className="text-xl font-bold">
                              {new Date(date).toLocaleDateString("bn-BD", {
                                day: "2-digit",
                              })}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight">
                              {new Date(date).toLocaleDateString("bn-BD", {
                                weekday: "long",
                              })}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {new Date(date).getFullYear()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8 items-center pr-2">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase mb-0.5 tracking-tighter">
                              মোট আয়
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              ৳{dailyIncome.toLocaleString("bn-BD")}
                            </p>
                          </div>
                          <div className="text-right hidden sm:block border-l border-slate-100 pl-8">
                            <p className="text-[9px] font-bold text-rose-600 uppercase mb-0.5 tracking-tighter">
                              মোট ব্যয়
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              ৳{dailyExpense.toLocaleString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Transactions List */}
                      <div className="grid gap-4 pl-2">
                        {txs.map((tx) => (
                          <div
                            key={tx.id}
                            className="group bg-white  border border-transparent hover:border-emerald-100 p-5 rounded-[2rem] flex items-center justify-between hover:shadow-[0_10px_40px_rgb(0,0,0,0.03)] transition-all"
                          >
                            <div className="flex items-center gap-5">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                  tx.type === "income"
                                    ? "bg-emerald-50 text-emerald-600 shadow-inner"
                                    : "bg-rose-50 text-rose-600 shadow-inner"
                                }`}
                              >
                                {tx.type === "income" ? (
                                  <TrendingUp size={22} />
                                ) : (
                                  <TrendingDown size={22} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-lg leading-tight mb-1">
                                  {tx.category}
                                </p>
                                <p className="text-xs font-bold text-slate-400 italic">
                                  {tx.notes
                                    ? `"${tx.notes}"`
                                    : "কোনো নোট যোগ করা নেই"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                              {/* টাকার পরিমাণ */}
                              <div className="text-right">
                                <p
                                  className={`text-lg md:text-xl font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {tx.type === "income" ? "+" : "-"} ৳
                                  {tx.amount.toLocaleString("bn-BD")}
                                </p>
                              </div>

                              {/* ডেস্কটপ ভিউ: সরাসরি বাটন (md:flex) */}
                              <div className="hidden md:flex gap-2">
                                <button
                                  onClick={() => handleEditClick(tx)}
                                  className="p-3 text-slate-200 hover:text-emerald-500 transition-all rounded-xl hover:bg-emerald-50"
                                >
                                  <Edit2 size={20} />
                                </button>
                                <button
                                  onClick={() => setDeleteTxId(tx.id)}
                                  className="p-3 text-slate-200 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>

                              {/* মোবাইল ভিউ: ৩-ডট মেনু (md:hidden) */}
                              <div className="md:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
                                      <MoreVertical size={20} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="rounded-2xl border-none shadow-2xl p-2 bg-white min-w-[140px]"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => handleEditClick(tx)}
                                      className="flex items-center gap-3 font-bold text-slate-600 p-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer"
                                    >
                                      <Edit2 size={16} />
                                      <span>সম্পাদনা</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setDeleteTxId(tx.id)}
                                      className="flex items-center gap-3 font-bold text-rose-500 p-3 rounded-xl focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                      <span>মুছে ফেলুন</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTx} onOpenChange={() => setEditingTx(null)}>
        <DialogContent className="rounded-[3rem] max-w-md border-none p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900">
              লেনদেন সম্পাদনা
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">তারিখ</label>
              <Input
                type="date"
                value={editData.date}
                onChange={(e) =>
                  setEditData({ ...editData, date: e.target.value })
                }
                className="rounded-2xl bg-slate-50 border-none h-11 font-semibold"
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ধরন</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEditData({ ...editData, type: "income" })}
                  className={`p-3 rounded-2xl font-bold transition-all ${
                    editData.type === "income"
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                      : "bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  আয়
                </button>
                <button
                  onClick={() => setEditData({ ...editData, type: "expense" })}
                  className={`p-3 rounded-2xl font-bold transition-all ${
                    editData.type === "expense"
                      ? "bg-rose-100 text-rose-700 border-2 border-rose-500"
                      : "bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  ব্যয়
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                পরিমাণ (৳)
              </label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
                className="rounded-2xl bg-slate-50 border-none h-11 font-semibold"
              />
            </div>

            {/* Category Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <Tag size={16} className="text-slate-400" />
                <label className="text-sm font-bold text-slate-700">
                  ক্যাটাগরি
                </label>
              </div>
              <select
                value={editData.category}
                onChange={(e) =>
                  setEditData({ ...editData, category: e.target.value })
                }
                className="w-full h-11 px-4 font-semibold rounded-2xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
              >
                <option value="">ক্যাটাগরি সিলেক্ট করুন</option>
                {popularCategories[editData.type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                বিবরণ (ঐচ্ছিক)
              </label>
              <Input
                type="text"
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                placeholder="অতিরিক্ত তথ্য..."
                className="rounded-2xl bg-slate-50 border-none h-11 font-semibold"
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl h-12 font-bold border-slate-100 hover:bg-slate-50"
              onClick={() => setEditingTx(null)}
            >
              বাতিল
            </Button>
            <Button
              className="flex-1 rounded-2xl h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              onClick={handleSaveEdit}
            >
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <DialogContent className="rounded-[3rem] max-w-sm border-none p-10 bg-white">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-inner">
              <Trash2 size={36} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900">
                মুছে ফেলবেন?
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              লেনদেনটি মুছে ফেললে আপনার বর্তমান ব্যালেন্স থেকেও এটি স্থায়ীভাবে
              বাদ যাবে।
            </p>
          </div>
          <DialogFooter className="flex-row gap-4 mt-10">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl h-14 font-bold border-slate-100 hover:bg-slate-50"
              onClick={() => setDeleteTxId(null)}
            >
              না
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl h-14 font-bold shadow-lg shadow-rose-100 transition-all"
              onClick={() => {
                if (deleteTxId) {
                  deleteTransaction(deleteTxId);
                  setDeleteTxId(null);
                }
              }}
            >
              হ্যাঁ, মুছুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
