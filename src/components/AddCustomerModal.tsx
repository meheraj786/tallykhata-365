import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLedgerStore } from "../store/useLedgerStore";
import { UserPlus, Phone, User } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCustomerModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { addCustomer } = useLedgerStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await addCustomer(name, phone);
    setLoading(false);
    setName("");
    setPhone("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none p-8 bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            নতুন <span className="text-emerald-600">কাস্টমার</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">কাস্টমারের নাম</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="নাম লিখুন..."
                className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ফোন নম্বর (ঐচ্ছিক)</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="নম্বর লিখুন..."
                className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
              />
            </div>
          </div>

          <Button
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-100"
          >
            <UserPlus className="mr-2" size={20} />
            {loading ? "যোগ হচ্ছে..." : "কাস্টমার যোগ করুন"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}