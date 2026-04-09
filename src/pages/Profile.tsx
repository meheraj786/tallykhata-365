import { auth } from "../lib/firebase";
import { useLedgerStore } from "../store/useLedgerStore";
import { Users, Wallet, Calendar, Mail, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

export default function Profile() {
  const user = auth.currentUser;
  const { customers, getTotalReceivable } = useLedgerStore();
  
  const receivable = getTotalReceivable();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
           <div className="w-24 h-24 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-100 mb-4">
             {user?.displayName?.charAt(0) || "U"}
           </div>
           <h1 className="text-3xl font-black text-slate-900">{user?.displayName || "ব্যবহারকারী"}</h1>
           <p className="text-slate-400 font-bold">{user?.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm text-center border border-slate-100">
            <Users className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="text-[10px] font-black text-slate-400 uppercase">মোট কাস্টমার</p>
            <p className="text-xl font-black">{customers.length} জন</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm text-center border border-slate-100">
            <Wallet className="mx-auto mb-2 text-emerald-500" size={24} />
            <p className="text-[10px] font-black text-slate-400 uppercase">মোট পাওনা</p>
            <p className="text-xl font-black">৳{receivable.toLocaleString("bn-BD")}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
           <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <Calendar className="text-slate-400" size={20} />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">অ্যাকাউন্ট তৈরি</p>
                <p className="font-bold text-slate-700">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('bn-BD') : "N/A"}</p>
              </div>
           </div>
           <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center justify-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-colors"
           >
              <LogOut size={20} /> লগআউট করুন
           </button>
        </div>
      </div>
    </div>
  );
}