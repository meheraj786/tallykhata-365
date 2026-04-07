import { useState } from "react";
import { startOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useKhataStore } from "../store/useKhataStore";
import {
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";

export default function Reports() {
  const { getTotalIncome, getTotalExpense, transactions } = useKhataStore();
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "yearly">(
    "weekly",
  );

  const income = getTotalIncome();
  const expense = getTotalExpense();
  const balance = income - expense;

  // Data functions remain same (logic unchanged)
  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return format(date, "yyyy-MM-dd");
    });
    return days.map((day) => {
      const dayTxs = transactions.filter((tx) => tx.date === day);
      return {
        day: format(new Date(day), "eee").substring(0, 3),
        income: dayTxs
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        expense: dayTxs
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    });
  };

  const getMonthlyData = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    return Array.from({ length: monthEnd.getDate() }, (_, i) => {
      const date = new Date(monthStart);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTxs = transactions.filter((tx) => tx.date === dateStr);
      return {
        day: format(date, "d"),
        income: dayTxs
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        expense: dayTxs
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    });
  };

  const getYearlyData = () => {
    const months = [
      "জান",
      "ফেব",
      "মার",
      "এপ",
      "মে",
      "জুন",
      "জুল",
      "আগ",
      "সেপ",
      "অক্টো",
      "নভ",
      "ডিসেম",
    ];
    return months.map((m, i) => {
      const monthTxs = transactions.filter(
        (tx) => new Date(tx.date).getMonth() === i,
      );
      return {
        day: m,
        income: monthTxs
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        expense: monthTxs
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    });
  };

  const getCategoryBreakdown = () => {
    const data: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        data[tx.category] = (data[tx.category] || 0) + tx.amount;
      });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const COLORS = [
    "#10b981",
    "#f43f5e",
    "#f59e0b",
    "#6366f1",
    "#06b6d4",
    "#d946ef",
    "#8b5cf6",
    "#f97316",
  ];

  const currentChartData =
    reportType === "weekly"
      ? getWeeklyData()
      : reportType === "monthly"
        ? getMonthlyData()
        : getYearlyData();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pb-24">
        {/* Page Title */}
        <div className="mb-8 space-y-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            হিসাব <span className="text-emerald-600">বিশ্লেষণ</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            আপনার লেনদেনের গ্রাফিকাল রিপোর্ট দেখুন
          </p>
        </div>

        {/* Global Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: "মোট আয়",
              value: income,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
              icon: ArrowUpRight,
            },
            {
              label: "মোট ব্যয়",
              value: expense,
              color: "text-rose-600",
              bg: "bg-rose-50 dark:bg-rose-500/10",
              icon: ArrowDownLeft,
            },
            {
              label: "ব্যালেন্স",
              value: balance,
              color: balance >= 0 ? "text-blue-600" : "text-rose-600",
              bg: "bg-blue-50 dark:bg-blue-500/10",
              icon: Wallet,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border-none shadow-sm rounded-[2rem] overflow-hidden"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    ৳{stat.value.toLocaleString("bn-BD")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid: Desktop 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-md rounded-[2.5rem] p-4 md:p-8 dark:bg-slate-900">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-emerald-600" size={20} />
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                    আয়-ব্যয় গ্রাফ
                  </h3>
                </div>

                {/* Modern Toggle Switch */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
                  {(["weekly", "monthly", "yearly"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setReportType(type)}
                      className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        reportType === type
                          ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {type === "weekly"
                        ? "সাপ্তাহিক"
                        : type === "monthly"
                          ? "মাসিক"
                          : "বার্ষিক"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(v) => [`৳${v?.toLocaleString("bn-BD")}`, ""]}
                    />
                    <Bar
                      dataKey="income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={reportType === "monthly" ? 6 : 12}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      barSize={reportType === "monthly" ? 6 : 12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Breakdown Section */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-md rounded-[2.5rem] p-8 dark:bg-slate-900 h-full">
              <div className="flex items-center gap-2 mb-6">
                <PieIcon className="text-emerald-600" size={20} />
                <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                  ব্যয় বিভাজন
                </h3>
              </div>

              {getCategoryBreakdown().length > 0 ? (
                <div className="space-y-8">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryBreakdown()}
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {getCategoryBreakdown().map((_, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legends List */}
                  <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {getCategoryBreakdown().map((cat, i) => (
                      <div
                        key={cat.name}
                        className="flex justify-between items-center group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ৳{cat.value.toLocaleString("bn-BD")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                  <PieIcon size={48} className="opacity-10 mb-4" />
                  <p className="text-sm font-medium">
                    কোনো খরচের ডেটা পাওয়া যায়নি
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
