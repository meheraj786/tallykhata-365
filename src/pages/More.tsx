import { Card, CardContent } from "@/components/ui/card";
import { Info, ShieldCheck, Database, Smartphone } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";

export default function More() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-5 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900">
            আরও <span className="text-emerald-600">অপশন</span>
          </h1>
          <p className="text-slate-500 font-bold">
            অ্যাপ সেটিংস এবং নিরাপত্তা তথ্য
          </p>
        </div>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Info size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-tight">
                  টালিখাতা 365 v2.0
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Digital Ledger Cloud Edition
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] flex gap-4">
                <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                <p className="text-sm font-bold text-slate-600">
                  আপনার সব তথ্য আপনার অ্যাকাউন্টের সাথে ক্লাউডে সুরক্ষিত।
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] flex gap-4">
                <Database className="text-emerald-500 shrink-0" size={24} />
                <p className="text-sm font-bold text-slate-600">
                  ইন্টারনেট না থাকলেও অফলাইনে হিসাব রাখা যাবে।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2.6rem] shadow-xl shadow-emerald-100">
          <div className="bg-white rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="text-emerald-600" size={24} />
              <span className="font-black text-slate-900 uppercase">
                ইনস্টলেশন
              </span>
            </div>
            <InstallPWA />
          </div>
        </div>

        <footer className="text-center pt-12">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
            Made by{" "}
            <a className="text-blue-400" href="https://github.com/meheraj786">
              Meheraj H.
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
