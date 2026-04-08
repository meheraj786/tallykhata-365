import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            স্বাগতম <span className="text-emerald-600">খাতায়</span>
          </h1>
          <p className="text-slate-500 font-semibold mt-2">আপনার হিসেবে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="email"
              placeholder="ইমেইল"
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="password"
              placeholder="পাসওয়ার্ড"
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}

          <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg shadow-lg shadow-emerald-100">
            <LogIn className="mr-2" size={20} /> লগইন করুন
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-semibold text-sm">
            নতুন ইউজার?{" "}
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline">
              অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}