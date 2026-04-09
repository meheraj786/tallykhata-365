import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Users, 
  Search, 
  Phone, 
  ArrowUpRight, 
  ArrowDownLeft,
  UserPlus
} from "lucide-react";
import { useLedgerStore } from "../store/useLedgerStore";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  onAddCustomerClick: () => void;
}

export default function Home({ onAddCustomerClick }: Props) {
  const navigate = useNavigate();
  const { customers, getTotalReceivable, getTotalPayable } = useLedgerStore();
  const [searchQuery, setSearchQuery] = useState("");

  const receivable = getTotalReceivable();
  const payable = getTotalPayable();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12 pb-32 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              টালিখাতা<span className="text-emerald-600">365</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" />
              মোট {customers.length} জন কাস্টমার
            </p>
          </div>

          <button
            onClick={onAddCustomerClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95"
          >
            <UserPlus size={20} />
            <span className="hidden md:inline">নতুন কাস্টমার</span>
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ArrowUpRight size={80} />
            </div>
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">মোট পাবেন (পাওনা)</p>
              <h2 className="text-4xl font-black text-slate-900">
                ৳ {receivable.toLocaleString("bn-BD")}
              </h2>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ArrowDownLeft size={80} />
            </div>
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest">মোট দিবেন (দেনা)</p>
              <h2 className="text-4xl font-black text-slate-900">
                ৳ {payable.toLocaleString("bn-BD")}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            className="w-full h-16 pl-14 pr-6 rounded-3xl bg-white border-none shadow-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Customer List */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">কাস্টমার লিস্ট</h3>
          
          {filteredCustomers.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
              <Users size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">কোনো কাস্টমার পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => navigate(`/customer/${customer.id}`)}
                  className="group bg-white p-6 rounded-[2rem] border border-transparent hover:border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                        {customer.name}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1">
                        <Phone size={12} />
                        {customer.phone || "নম্বর নেই"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${customer.totalDue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {customer.totalDue >= 0 ? 'আপনি পাবেন' : 'আপনি দিবেন'}
                    </p>
                    <p className={`text-xl font-black ${customer.totalDue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ৳ {Math.abs(customer.totalDue).toLocaleString("bn-BD")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}