import { useState, useMemo, useEffect } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  parseISO,
} from "date-fns";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLedgerStore, LedgerEntry } from "../store/useLedgerStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  BarChart3,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

type FilterType = "daily" | "weekly" | "monthly" | "yearly";

export default function Reports() {
  const { customers } = useLedgerStore();
  const { user } = useAuthStore();
  const [localTransactions, setLocalTransactions] = useState<LedgerEntry[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("weekly");
  const [customDate, setCustomDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#6366f1",
    "#f43f5e",
    "#ec4899",
  ];

  useEffect(() => {
    if (!user || customers.length === 0) {
      return;
    }

    const transactionMap = new Map<string, LedgerEntry[]>();
    const unsubscribeList: Array<() => void> = [];

    const syncTransactions = () => {
      const allEntries = Array.from(transactionMap.values()).flat();
      allEntries.sort((a, b) => b.createdAt - a.createdAt);
      setLocalTransactions(allEntries);
    };

    customers.forEach((customer) => {
      const q = query(
        collection(db, "users", user.uid, "customers", customer.id, "ledger"),
        orderBy("createdAt", "desc"),
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          transactionMap.set(
            customer.id,
            snapshot.docs.map((d) => {
              const data = d.data() as Omit<LedgerEntry, "id">;
              return { id: d.id, ...data };
            }),
          );
          syncTransactions();
        },
        (error) => {
          console.error("Reports ledger listener error:", error);
        },
      );
      unsubscribeList.push(unsubscribe);
    });

    return () => unsubscribeList.forEach((unsubscribe) => unsubscribe());
  }, [user, customers]);

  const filteredData = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;
    if (filterType === "daily") {
      start = startOfDay(parseISO(customDate));
      end = endOfDay(parseISO(customDate));
    } else if (filterType === "weekly") {
      start = startOfWeek(today);
      end = endOfWeek(today);
    } else if (filterType === "monthly") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else {
      start = startOfYear(today);
      end = endOfYear(today);
    }

    return localTransactions.filter((tx) => {
      if (!tx.date) return false;
      return isWithinInterval(parseISO(tx.date), { start, end });
    });
  }, [localTransactions, filterType, customDate]);

  const stats = useMemo(() => {
    const gave = filteredData
      .filter((t) => t.type === "gave")
      .reduce((s, t) => s + t.amount, 0);
    const received = filteredData
      .filter((t) => t.type === "received")
      .reduce((s, t) => s + t.amount, 0);
    return { gave, received, net: received - gave };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const map: Record<
      string,
      { name: string; gave: number; received: number }
    > = {};
    filteredData.forEach((tx) => {
      const label =
        filterType === "yearly"
          ? format(parseISO(tx.date), "MMM")
          : format(parseISO(tx.date), "dd MMM");
      if (!map[label]) map[label] = { name: label, gave: 0, received: 0 };
      if (tx.type === "gave") map[label].gave += tx.amount;
      else map[label].received += tx.amount;
    });
    return Object.values(map);
  }, [filteredData, filterType]);

  const topDebtors = useMemo(() => {
    const customerMap = new Map<string, { name: string; value: number }>();

    filteredData.forEach((tx) => {
      if (tx.type !== "gave") return;
      const name = tx.customerName || "অজানা";
      const existing = customerMap.get(name) ?? { name, value: 0 };
      existing.value += tx.amount;
      customerMap.set(name, existing);
    });

    return Array.from(customerMap.values())
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900">
              হিসাব <span className="text-emerald-600">রিপোর্ট</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              রিয়েল-টাইম আদান-প্রদান বিশ্লেষণ
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
            {(["daily", "weekly", "monthly", "yearly"] as FilterType[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}
                >
                  {t === "daily"
                    ? "আজ"
                    : t === "weekly"
                      ? "সপ্তাহ"
                      : t === "monthly"
                        ? "মাস"
                        : "বছর"}
                </button>
              ),
            )}
          </div>
        </div>
        {filterType === "daily" && (
          <div className="flex justify-center md:justify-end">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="p-3 rounded-xl border-none shadow-sm font-bold text-slate-600 outline-none"
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  পেয়েছি (In)
                </p>
                <p className="text-xl font-black text-emerald-600">
                  ৳{stats.received.toLocaleString("bn-BD")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownLeft />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  দিয়েছি (Out)
                </p>
                <p className="text-xl font-black text-rose-600">
                  ৳{stats.gave.toLocaleString("bn-BD")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Wallet />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  নেট ক্যাশ
                </p>
                <p
                  className={`text-xl font-black ${stats.net >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  ৳{stats.net.toLocaleString("bn-BD")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 border-none shadow-md rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-2 mb-8">
              <BarChart3 className="text-emerald-600" size={20} />
              <h3 className="font-bold text-lg">লেনদেন গ্রাফ</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "15px", border: "none" }}
                  />
                  <Bar
                    dataKey="received"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="gave" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="lg:col-span-4 border-none shadow-md rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <Users className="text-emerald-600" size={20} />
              <h3 className="font-bold text-lg">শীর্ষ পাওনা</h3>
            </div>
            {topDebtors.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={topDebtors}
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={5}
                      >
                        {topDebtors.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {topDebtors.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs font-bold p-2.5 bg-slate-50 rounded-xl shadow-sm"
                  >
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900">
                      ৳{item.value.toLocaleString("bn-BD")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 text-sm mt-10">
                কোনো তথ্য নেই
              </p>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 ml-2">
            লেনদেন ইতিহাস ({filteredData.length})
          </h3>
          {filteredData.length > 0 ? (
            <div className="grid gap-3">
              {filteredData.map((tx) => (
                <Card
                  key={tx.id}
                  className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === "gave" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {tx.type === "gave" ? (
                          <ArrowDownLeft size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">
                          {tx.customerName || "অজানা"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                          <Calendar size={10} /> {tx.date}{" "}
                          <Clock size={10} className="ml-1" /> {tx.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black text-lg ${tx.type === "gave" ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {tx.type === "gave" ? "-" : "+"} ৳
                        {tx.amount.toLocaleString("bn-BD")}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 italic">
                        "{tx.note}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold italic">
                লেনদেন পাওয়া যায়নি
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
