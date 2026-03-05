import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LogIn, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back!");
      window.location.href = "/";
    },
    onError: error => {
      toast.error(error.message);
      if (error.message.includes("verify")) {
        setLocation(`/verify?email=${encodeURIComponent(email)}`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <main className="container pt-32 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-[#F2F0EB] mb-2">
              WELCOME BACK
            </h1>
            <p className="font-ui text-sm text-[#8A8880]">
              Sign in to comment and like articles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                  size={16}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                  size={16}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-[#8A8880] hover:text-[#E8A020] transition-colors uppercase tracking-widest font-ui font-600"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <LogIn size={16} />
              )}
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center font-ui text-xs text-[#555550]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#E8A020] hover:underline font-600"
            >
              Register now
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
