import { useState } from "react";
import { Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKhataStore } from "../store/useKhataStore";

export default function Transactions() {
  const { transactions, deleteTransaction } = useKhataStore();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // Get unique years from transactions
  const availableYears = [
    "all",
    ...Array.from(
      new Set(transactions.map((tx) => new Date(tx.date).getFullYear())),
    ).sort((a, b) => b - a),
  ];

  const filteredTx = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);

      if (selectedDate) {
        return tx.date === selectedDate;
      }

      if (selectedMonth !== "all" && selectedYear !== "all") {
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth) - 1; // JS months are 0-based
        return txDate.getFullYear() === year && txDate.getMonth() === month;
      }

      if (selectedYear !== "all") {
        return txDate.getFullYear() === parseInt(selectedYear);
      }

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

  // Group transactions by date
  const groupedTx = filteredTx.reduce(
    (groups, tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
      return groups;
    },
    {} as Record<string, typeof filteredTx>,
  );

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">সব খাতা</h1>

      {/* Filter Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="year-select">বছর</Label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background"
          >
            <option value="all">সব বছর</option>
            {availableYears.slice(1).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="month-select">মাস</Label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background"
          >
            <option value="all">সব মাস</option>
            {[
              "জানুয়ারি",
              "ফেব্রুয়ারি",
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
            ].map((month, index) => (
              <option
                key={index + 1}
                value={String(index + 1).padStart(2, "0")}
              >
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="date-input">তারিখ</Label>
          <Input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="text-emerald-600 mx-auto mb-2" size={24} />
            <p className="text-sm text-muted-foreground">আয়</p>
            <p className="text-lg font-semibold text-emerald-600">
              ৳ {totalIncome.toLocaleString("bn-BD")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="text-red-600 mx-auto mb-2" size={24} />
            <p className="text-sm text-muted-foreground">ব্যয়</p>
            <p className="text-lg font-semibold text-red-600">
              ৳ {totalExpense.toLocaleString("bn-BD")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign
              className={`mx-auto mb-2 ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
              size={24}
            />
            <p className="text-sm text-muted-foreground">ব্যালেন্স</p>
            <p
              className={`text-lg font-semibold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              ৳ {balance.toLocaleString("bn-BD")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedTx).length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            কোনো এন্ট্রি নেই
          </p>
        ) : (
          Object.entries(groupedTx)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, txs]) => {
              const dailyIncome = txs
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);
              const dailyExpense = txs
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);
              const dailyBalance = dailyIncome - dailyExpense;

              return (
                <div key={date} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex justify-between items-center py-2 border-b">
                    <h3 className="font-semibold text-lg">
                      {new Date(date).toLocaleDateString("bn-BD", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-600">
                        আয়: ৳{dailyIncome.toLocaleString("bn-BD")}
                      </span>
                      <span className="text-red-600">
                        ব্যয়: ৳{dailyExpense.toLocaleString("bn-BD")}
                      </span>
                      <span
                        className={
                          dailyBalance >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        ব্যালেন্স: ৳{dailyBalance.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>

                  {/* Transactions for this date */}
                  {txs.map((tx) => (
                    <Card
                      key={tx.id}
                      className="p-4 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xl ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {tx.type === "income" ? "↑" : "↓"}
                          </span>
                          <div>
                            <p className="font-medium">{tx.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.notes || "কোনো নোট নেই"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`font-bold text-xl ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {tx.type === "income" ? "+" : "-"}৳
                          {tx.amount.toLocaleString("bn-BD")}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTxId(tx.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ডিলিট কনফার্মেশন</DialogTitle>
          </DialogHeader>
          <p>
            আপনি কি এই ট্রানজেকশন ডিলিট করতে চান? এই অ্যাকশন আনডু করা যাবে না।
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTxId(null)}>
              ক্যানসেল
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTxId) {
                  deleteTransaction(deleteTxId);
                  setDeleteTxId(null);
                }
              }}
            >
              ডিলিট
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
