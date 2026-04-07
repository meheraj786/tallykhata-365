import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { popularCategories } from "../types";
import { Banknote, Calendar as CalendarIcon, Tag, PencilLine, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "পরিমাণ ০ এর বেশি হতে হবে"),
  category: z.string().min(1, "ক্যাটাগরি সিলেক্ট করুন"),
  notes: z.string().optional(),
  date: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTransactionModal({ open, onOpenChange }: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const addTransaction = useKhataStore((state) => state.addTransaction);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    setValue("type", type);
  }, [type, setValue]);

  const onSubmit = (data: FormData) => {
    addTransaction({
      type: data.type,
      amount: data.amount,
      category: data.category,
      notes: data.notes,
      date: data.date,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[3rem] h-screen overflow-y-auto border-none p-8 shadow-2xl bg-white ">
        
        {/* Modal Header */}
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            নতুন <span className="text-emerald-600">এন্ট্রি</span>
          </DialogTitle>
        </DialogHeader>

        {/* Transaction Type Tabs */}
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as typeof type)}
          className="w-full mb-8"
        >
          <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 rounded-2xl h-14">
            <TabsTrigger 
              value="expense" 
              className={`rounded-xl font-black transition-all ${
                type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
              }`}
            >
              ব্যয় (Expense)
            </TabsTrigger>
            <TabsTrigger 
              value="income" 
              className={`rounded-xl font-black transition-all ${
                type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
              }`}
            >
              আয় (Income)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Amount Input Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
               <Banknote size={16} className="text-slate-400" />
               <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">টাকার পরিমাণ</Label>
            </div>
            <div className="relative group">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">৳</span>
               <Input
                type="number"
                placeholder="0"
                {...register("amount", { valueAsNumber: true })}
                className="text-4xl h-20 pl-12 text-center font-black rounded-[2rem] bg-slate-50 border-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all"
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 font-bold ml-4">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                 <Tag size={16} className="text-slate-400" />
                 <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">ক্যাটাগরি</Label>
              </div>
              <select
                {...register("category")}
                className="w-full h-14 px-4 font-black rounded-2xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
              >
                {popularCategories[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                 <CalendarIcon size={16} className="text-slate-400" />
                 <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">তারিখ</Label>
              </div>
              <Input 
                type="date" 
                {...register("date")} 
                className="h-14 font-black rounded-2xl bg-slate-50 border-none px-4 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
               <PencilLine size={16} className="text-slate-400" />
               <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">নোট (ঐচ্ছিক)</Label>
            </div>
            <Input 
              placeholder="বিস্তারিত কিছু লিখুন..." 
              {...register("notes")} 
              className="h-14 font-semibold rounded-2xl bg-slate-50 border-none px-5 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-16 text-lg font-black rounded-3xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <CheckCircle2 size={20} />
              সেভ করুন
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}