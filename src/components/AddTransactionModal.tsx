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

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1),
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

  const { register, handleSubmit, setValue, reset } = useForm<FormData>({
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">নতুন এন্ট্রি</DialogTitle>
        </DialogHeader>

        <Tabs
          value={type}
          onValueChange={(v) => setType(v as typeof type)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="text-red-600">
              ব্যয়
            </TabsTrigger>
            <TabsTrigger value="income" className="text-emerald-600">
              আয়
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>টাকার পরিমাণ (৳)</Label>
            <Input
              type="number"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
              className="text-3xl h-14 text-center font-semibold"
            />
          </div>

          <div>
            <Label>ক্যাটাগরি</Label>
            <select
              {...register("category")}
              className="w-full p-3 border rounded-lg bg-background"
            >
              {popularCategories[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>তারিখ</Label>
            <Input type="date" {...register("date")} />
          </div>

          <div>
            <Label>নোট (ঐচ্ছিক)</Label>
            <Input placeholder="বিস্তারিত লিখুন..." {...register("notes")} />
          </div>

          <Button type="submit" className="w-full h-12 text-lg">
            সেভ করুন
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
