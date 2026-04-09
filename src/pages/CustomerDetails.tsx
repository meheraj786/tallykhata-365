import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useLedgerStore, LedgerEntry } from "../store/useLedgerStore";
import { 
  ArrowLeft, Phone, Trash2, Plus, Minus, Calendar, MoreVertical, Edit2, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, activeLedger, setActiveLedger, addLedgerEntry, deleteLedgerEntry, updateLedgerEntry, deleteCustomer } = useLedgerStore();
  
  const customer = customers.find(c => c.id === id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [editData, setEditData] = useState({ amount: 0, note: "", type: 'gave' as 'gave' | 'received', date: "" });

  useEffect(() => {
    if (!auth.currentUser || !id) return;
    const q = query(
      collection(db, "users", auth.currentUser.uid, "customers", id, "ledger"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setActiveLedger(list);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [id, setActiveLedger]);

  const handleEntry = async (type: 'gave' | 'received') => {
    if (!id || !amount || !customer) return;
    await addLedgerEntry(id, customer.name, {
      amount: Number(amount),
      type,
      note: note || (type === 'gave' ? "বাকি" : "নগদ"),
      date: entryDate
    });
    setAmount("");
    setNote("");
  };

  const handleUpdate = async () => {
    if (!id || !editingEntry) return;
    await updateLedgerEntry(id, editingEntry.id, editingEntry, {
      amount: editData.amount,
      note: editData.note,
      type: editData.type,
      date: editData.date
    });
    setEditingEntry(null);
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-52">
      <div className="bg-white p-4 md:p-6 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft size={24} /></button>
            <div>
              <h2 className="font-black text-xl text-slate-900 leading-none">{customer.name}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1"><Phone size={10} /> {customer.phone || "নম্বর নেই"}</p>
            </div>
          </div>
          <button onClick={() => confirm("মুছে ফেলবেন?") && id && deleteCustomer(id).then(() => navigate("/"))} className="text-rose-400 p-2"><Trash2 size={20} /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className={`p-8 rounded-[2.5rem] text-center shadow-xl ${customer.totalDue >= 0 ? 'bg-emerald-600' : 'bg-rose-600'} text-white transition-all`}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">বর্তমান ব্যালেন্স</p>
          <h1 className="text-4xl text-white! font-black">৳ {Math.abs(customer.totalDue).toLocaleString("bn-BD")}</h1>
          <p className="text-xs font-bold mt-2 opacity-90">{customer.totalDue >= 0 ? "আপনি পাবেন" : "কাস্টমার পাবে"}</p>
        </div>

        <div className="space-y-3">
          {activeLedger.map((entry) => (
            <div key={entry.id} className="bg-white p-5 rounded-3xl flex items-center justify-between border border-transparent shadow-sm group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.type === 'gave' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {entry.type === 'gave' ? <Plus size={20} /> : <Minus size={20} />}
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-tight">{entry.note}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase mt-1">
                    <Calendar size={10} /> {entry.date} <Clock size={10} className="ml-1" /> {entry.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-black text-lg ${entry.type === 'gave' ? 'text-rose-600' : 'text-emerald-600'}`}>৳{entry.amount.toLocaleString("bn-BD")}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button className="p-2 text-slate-300 hover:text-slate-600 transition-all"><MoreVertical size={20} /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                    <DropdownMenuItem onClick={() => { setEditingEntry(entry); setEditData({ amount: entry.amount, note: entry.note, type: entry.type, date: entry.date }); }} className="flex items-center gap-2 font-bold p-3 cursor-pointer rounded-xl focus:bg-emerald-50 focus:text-emerald-600"><Edit2 size={16} /> এডিট</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteLedgerEntry(customer.id, entry.id, entry.amount, entry.type)} className="flex items-center gap-2 font-bold p-3 cursor-pointer rounded-xl text-rose-500 focus:bg-rose-50 focus:text-rose-600"><Trash2 size={16} /> মুছুন</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed md:bottom-0 bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t p-4 z-40 md:left-56 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <input type="number" placeholder="৳ পরিমাণ" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 px-4 rounded-xl bg-slate-100 border-none font-black outline-none" />
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="h-12 px-4 rounded-xl bg-slate-100 border-none font-bold outline-none text-slate-600" />
            <input type="text" placeholder="নোট..." value={note} onChange={(e) => setNote(e.target.value)} className="col-span-2 md:col-span-1 h-12 px-4 rounded-xl bg-slate-100 border-none font-bold outline-none" />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleEntry('gave')} className="flex-1 h-14 rounded-xl bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-100">দিয়েছি (Gave)</Button>
            <Button onClick={() => handleEntry('received')} className="flex-1 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black shadow-lg shadow-emerald-100">পেয়েছি (Got)</Button>
          </div>
        </div>
      </div>

      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="rounded-[2rem] border-none p-8 bg-white max-w-[90vw] md:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-black text-slate-900">লেনদেন সংশোধন</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setEditData({...editData, type: 'gave'})} className={`py-2 rounded-lg font-bold text-xs ${editData.type === 'gave' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"}`}>দিয়েছি</button>
              <button onClick={() => setEditData({...editData, type: 'received'})} className={`py-2 rounded-lg font-bold text-xs ${editData.type === 'received' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}>পেয়েছি</button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">তারিখ</label>
              <Input type="date" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">পরিমাণ</label>
              <Input type="number" value={editData.amount} onChange={(e) => setEditData({...editData, amount: Number(e.target.value)})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">নোট</label>
              <Input placeholder="নোট..." value={editData.note} onChange={(e) => setEditData({...editData, note: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
            <Button onClick={handleUpdate} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black mt-2">আপডেট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}