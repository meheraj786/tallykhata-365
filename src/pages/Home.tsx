import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useKhataStore } from "../store/useKhataStore";

interface Props {
  onAddClick: () => void;
}

export default function Home({ onAddClick }: Props) {
  const navigate = useNavigate();
  const { getBalance, getTodayTransactions, transactions } = useKhataStore();

  const balance = getBalance();
  const todayTx = getTodayTransactions();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-600">আমার খাতা</h1>
          <p className="text-muted-foreground">
            আজ {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>
        <Button
          onClick={onAddClick}
          size="icon"
          className="rounded-full h-12 w-12 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus size={28} />
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <p className="text-emerald-100 text-sm">মোট ব্যালেন্স</p>
          <p className="text-5xl font-bold mt-2 tracking-tight">
            ৳ {balance.toLocaleString("bn-BD")}
          </p>
        </CardContent>
      </Card>

      {/* Today Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-600" size={28} />
              <div>
                <p className="text-sm text-muted-foreground">আজকের আয়</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  ৳{" "}
                  {todayTx
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString("bn-BD")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="text-red-600" size={28} />
              <div>
                <p className="text-sm text-muted-foreground">আজকের ব্যয়</p>
                <p className="text-2xl font-semibold text-red-600">
                  ৳{" "}
                  {todayTx
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString("bn-BD")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">সাম্প্রতিক এন্ট্রি</h2>
          <Button variant="link" onClick={() => navigate("/transactions")}>
            সব দেখুন
          </Button>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              এখনো কোনো এন্ট্রি নেই। "+" বাটনে ক্লিক করে শুরু করুন।
            </Card>
          ) : (
            recentTransactions.map((tx) => (
              <Card key={tx.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium">{tx.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.date} • {tx.notes || ""}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold text-lg ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}৳{" "}
                    {tx.amount.toLocaleString("bn-BD")}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
