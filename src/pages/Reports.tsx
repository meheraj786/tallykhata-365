import { useState } from "react";
import { startOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useKhataStore } from "../store/useKhataStore";

export default function Reports() {
  const { getTotalIncome, getTotalExpense, transactions } = useKhataStore();
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "yearly">(
    "weekly",
  );

  const income = getTotalIncome();
  const expense = getTotalExpense();
  const balance = income - expense;

  // Weekly Data
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
      const dayIncome = dayTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        day: format(new Date(day), "eee").substring(0, 3),
        income: dayIncome,
        expense: dayExpense,
      };
    });
  };

  // Monthly Data
  const getMonthlyData = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = monthEnd.getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(monthStart);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTxs = transactions.filter((tx) => tx.date === dateStr);
      const dayIncome = dayTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        day: format(date, "d"),
        income: dayIncome,
        expense: dayExpense,
      };
    });
  };

  // Yearly Data
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

    return months.map((_, monthIndex) => {
      const monthTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === monthIndex;
      });
      const monthIncome = monthTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = monthTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        day: months[monthIndex],
        income: monthIncome,
        expense: monthExpense,
      };
    });
  };

  // Category Breakdown
  const getCategoryBreakdown = () => {
    const categoryData: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        categoryData[tx.category] =
          (categoryData[tx.category] || 0) + tx.amount;
      });
    return Object.entries(categoryData)
      .map(([category, amount]) => ({ name: category, value: amount }))
      .sort((a, b) => b.value - a.value);
  };

  const COLORS = [
    "#10b981",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-6">
      <h1 className="text-3xl font-bold mb-6">রিপোর্ট</h1>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>সারাংশ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg">
              <span>মোট আয়</span>
              <span className="text-emerald-600 font-semibold">
                ৳ {income.toLocaleString("bn-BD")}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span>মোট ব্যয়</span>
              <span className="text-red-600 font-semibold">
                ৳ {expense.toLocaleString("bn-BD")}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between text-xl font-bold">
              <span>ব্যালেন্স</span>
              <span
                className={balance >= 0 ? "text-emerald-600" : "text-red-600"}
              >
                ৳ {balance.toLocaleString("bn-BD")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Report Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setReportType("weekly")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              reportType === "weekly"
                ? "bg-emerald-600 text-white"
                : "bg-background border"
            }`}
          >
            সাপ্তাহিক
          </button>
          <button
            onClick={() => setReportType("monthly")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              reportType === "monthly"
                ? "bg-emerald-600 text-white"
                : "bg-background border"
            }`}
          >
            মাসিক
          </button>
          <button
            onClick={() => setReportType("yearly")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              reportType === "yearly"
                ? "bg-emerald-600 text-white"
                : "bg-background border"
            }`}
          >
            বার্ষিক
          </button>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "weekly"
                ? "সাপ্তাহিক আয়-ব্যয়"
                : reportType === "monthly"
                  ? "মাসিক আয়-ব্যয়"
                  : "বার্ষিক আয়-ব্যয়"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  reportType === "weekly"
                    ? getWeeklyData()
                    : reportType === "monthly"
                      ? getMonthlyData()
                      : getYearlyData()
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) =>
                    `৳${Number(value || 0).toLocaleString("bn-BD")}`
                  }
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="আয়" />
                <Bar dataKey="expense" fill="#ef4444" name="ব্যয়" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown by Category */}
        <Card>
          <CardHeader>
            <CardTitle>খরচ ভাঙন (ক্যাটাগরি অনুসারে)</CardTitle>
          </CardHeader>
          <CardContent>
            {getCategoryBreakdown().length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getCategoryBreakdown()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryBreakdown().map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `৳${Number(value || 0).toLocaleString("bn-BD")}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category Details */}
                <div className="space-y-2">
                  {getCategoryBreakdown().map((cat, index) => (
                    <div
                      key={cat.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="font-semibold">
                        ৳{cat.value.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">কোনো খরচ নেই</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
