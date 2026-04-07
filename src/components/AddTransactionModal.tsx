import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories, Transaction } from "../types";
import { 
  Banknote, 
  Calendar as CalendarIcon, 
  Tag, 
  PencilLine, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Layers, 
  User 
} from "lucide-react";

const singleSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "পরিমাণ ০ এর বেশি হতে হবে"),
  category: z.string().min(1, "ক্যাটাগরি সিলেক্ট করুন"),
  notes: z.string().max(20, "সর্বোচ্চ ২০ অক্ষর").optional(),
  date: z.string(),
});

const bulkSchema = z.object({
  transactions: z.array(singleSchema).min(1),
});

type FormData = z.infer<typeof singleSchema>;
type BulkFormData = z.infer<typeof bulkSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction | null;
}

export default function AddTransactionModal({ open, onOpenChange, editingTransaction = null }: Props) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [type, setType] = useState<"income" | "expense">("expense");
  const { addTransaction, updateTransaction } = useKhataStore();

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(mode === "single" ? singleSchema : bulkSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      transactions: [{ type: "expense", amount: 0, category: popularCategories["expense"][0], date: new Date().toISOString().split("T")[0], notes: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  useEffect(() => {
    if (editingTransaction) {
      setMode("single");
      setType(editingTransaction.type);
      reset({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        notes: editingTransaction.notes,
        date: editingTransaction.date,
      });
    } else {
      reset({
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        transactions: [{ type: "expense", amount: 0, category: popularCategories["expense"][0], date: new Date().toISOString().split("T")[0], notes: "" }]
      });
    }
  }, [editingTransaction, open, reset]);

  const onSubmit = (data: any) => {
    if (mode === "single") {
      if (editingTransaction) {
        updateTransaction(editingTransaction.id, data);
      } else {
        addTransaction(data);
      }
    } else {
      data.transactions.forEach((tx: any) => addTransaction(tx));
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col rounded-[3rem] h-auto max-h-[90vh] overflow-y-auto border-none p-8 shadow-2xl bg-white">
        
        <DialogHeader className="mb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            {editingTransaction ? "হিসাব" : "লেনদেন"} <span className="text-emerald-600">{editingTransaction ? "আপডেট" : "এন্ট্রি"}</span>
          </DialogTitle>
          
          {!editingTransaction && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${mode === "single" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}
              >
                <User size={14} className="inline mr-1" /> Single
              </button>
              <button 
                onClick={() => setMode("bulk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${mode === "bulk" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}
              >
                <Layers size={14} className="inline mr-1" /> Bulk
              </button>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          {mode === "single" ? (
            // SINGLE MODE UI
            <div className="space-y-6">
              <Tabs value={type} onValueChange={(v) => { setType(v as any); setValue("type", v); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 rounded-2xl h-14">
                  <TabsTrigger value="expense" className="rounded-xl font-black transition-all data-[state=active]:text-rose-600">ব্যয়</TabsTrigger>
                  <TabsTrigger value="income" className="rounded-xl font-black transition-all data-[state=active]:text-emerald-600">আয়</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">টাকার পরিমাণ</Label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-emerald-500">৳</span>
                  <Input type="number" {...register("amount", { valueAsNumber: true })} className="text-4xl h-20 pl-12 text-center font-black rounded-[2rem] bg-slate-50 border-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">ক্যাটাগরি</Label>
                  <select {...register("category")} className="w-full h-14 px-4 font-black rounded-2xl bg-slate-50 border-none">
                    {popularCategories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">তারিখ</Label>
                  <Input type="date" {...register("date")} className="h-14 font-black rounded-2xl bg-slate-50 border-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">নোট (সর্বোচ্চ ২০ অক্ষর)</Label>
                <Input placeholder="বিস্তারিত..." maxLength={20} {...register("notes")} className="h-14 font-semibold rounded-2xl bg-slate-50 border-none" />
              </div>
            </div>
          ) : (
            // BULK MODE UI
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input 
                      type="number" 
                      placeholder="৳ ০.০০" 
                      {...register(`transactions.${index}.amount`, { valueAsNumber: true })} 
                      className="h-12 font-black rounded-xl border-none bg-white shadow-sm"
                    />
                    <select 
                      {...register(`transactions.${index}.category`)} 
                      className="h-12 px-3 font-bold rounded-xl border-none bg-white shadow-sm text-sm"
                    >
                      {popularCategories["expense"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      {popularCategories["income"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <Input 
                      placeholder="নোট..." 
                      maxLength={20}
                      {...register(`transactions.${index}.notes`)} 
                      className="h-12 font-semibold rounded-xl border-none bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex gap-2">
                        <select 
                          {...register(`transactions.${index}.type`)} 
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border-none ${watch(`transactions.${index}.type`) === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                        >
                          <option value="expense">ব্যয়</option>
                          <option value="income">আয়</option>
                        </select>
                        <Input type="date" {...register(`transactions.${index}.date`)} className="h-8 text-[10px] font-bold border-none bg-transparent w-32" />
                     </div>
                     
                     {fields.length > 1 && (
                       <button onClick={() => remove(index)} className="text-rose-400 hover:text-rose-600 transition-colors">
                         <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => append({ type: "expense", amount: 0, category: popularCategories["expense"][0], date: new Date().toISOString().split("T")[0], notes: "" })}
                className="w-full border-dashed border-2 border-slate-200 rounded-2xl h-12 text-slate-400 font-bold hover:bg-slate-50 hover:text-emerald-600 transition-all"
              >
                <Plus size={16} className="mr-2" /> আরও যোগ করুন
              </Button>
            </div>
          )}

          <Button type="submit" className="w-full h-16 text-lg font-black rounded-3xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3">
            <CheckCircle2 size={20} />
            {editingTransaction ? "আপডেট করুন" : "সব সেভ করুন"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}