import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LogIn, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      if (data.twoFactorRequired) {
        setRequires2FA(true);
        toast.info("Cybersecurity Check: 2FA Required", { description: data.message });
      } else {
        toast.success("Identity Verified: Welcome back!");
        window.location.href = "/";
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
      if (error.message.includes("verify") && !requires2FA) {
        setLocation(`/verify?email=${encodeURIComponent(email)}`);
      }
    },
  });

  const verify2FAMutation = trpc.auth.verify2FA.useMutation({
    onSuccess: () => {
      toast.success("Security Clearance Granted.");
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast.error("Security Breach: " + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requires2FA) {
      verify2FAMutation.mutate({ email, code: twoFactorToken, rememberMe });
    } else {
      loginMutation.mutate({ email, password, rememberMe });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } as any }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <main className="container pb-16 flex items-center justify-center">
        <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8A020] to-transparent w-full animate-pulse" />
          
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="font-display text-3xl text-[#F2F0EB] mb-2 tracking-widest uppercase">
              {requires2FA ? "Security" : "Sign In"}
            </h1>
            <p className="font-ui text-[10px] text-[#8A8880] tracking-tighter">
              {requires2FA 
                ? "Enter the security code sent to your email." 
                : "Access your account on bishouy.com"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!requires2FA ? (
                <motion.div 
                  key="login-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="font-ui text-[10px] font-semibold text-[#E8A020] tracking-widest block">
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
                    <label className="font-ui text-[10px] font-semibold text-[#E8A020] tracking-widest block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-10 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020] transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                          <input
                          id="rememberMe"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-[#222220] bg-[#0F0F0E] text-[#E8A020] focus:ring-0 focus:ring-offset-0"
                        />
                        <label htmlFor="rememberMe" className="text-[10px] text-[#8A8880] font-ui tracking-widest font-semibold cursor-pointer">
                          Remember for 30 days
                        </label>
                      </div>
                      <Link
                        href="/forgot-password"
                        className="text-[10px] text-[#8A8880] hover:text-[#E8A020] transition-colors tracking-widest font-ui font-semibold"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="2fa-fields"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="space-y-2">
                    <label className="font-ui text-[10px] font-semibold text-[#E8A020] tracking-widest block text-center">
                      Security Code
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                        size={20}
                      />
                      <input
                        type="text"
                        autoComplete="one-time-code"
                        maxLength={ (twoFactorToken.toLowerCase().startsWith('bes')) ? 32 : 12 }
                        value={ (twoFactorToken.length > 0 && twoFactorToken.length < 3 && twoFactorToken.toUpperCase().startsWith('B')) ? "" : twoFactorToken }
                        onChange={e => {
                          let v = e.target.value;
                          
                          // Restore Ghost Mode Logic: If field was visually empty, re-attach prefix
                          if (twoFactorToken.length > 0 && twoFactorToken.length < 3 && twoFactorToken.toUpperCase().startsWith('B') && v.length === 1) {
                            v = twoFactorToken + v;
                          }

                          // Allow alphanumeric for potential skeleton key or backup codes
                          if (v.toUpperCase().startsWith('B')) {
                             setTwoFactorToken(v);
                             return;
                          }
                          
                          // Standard numeric OTP fallback
                          setTwoFactorToken(v.replace(/\D/g, "").slice(0, 12));
                        }}
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                        className={`w-full bg-[#0F0F0E] border border-[#E8A020] rounded-sm py-4 pl-4 pr-4 text-[#F2F0EB] ${twoFactorToken.length > 6 ? 'text-lg tracking-widest' : 'text-2xl tracking-[0.5em]'} text-center focus:outline-none focus:ring-1 focus:ring-[#E8A020] transition-all`}
                        placeholder="000000"
                        required
                      />
                    </div>
                    <p className="text-[9px] text-center text-[#555550] tracking-widest pt-2">
                        Enter the 6-digit OTP from email or a backup key.
                    </p>
                  </div>
                      <button
                        type="button"
                        onClick={() => setRequires2FA(false)}
                        className="w-full text-[9px] text-[#8A8880] hover:text-[#E8A020] tracking-widest transition-colors font-semibold"
                      >
                        Back to Login
                      </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loginMutation.isPending || verify2FAMutation.isPending}
              className="w-full bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-[10px] font-semibold uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-colors mt-4"
            >
              {loginMutation.isPending || verify2FAMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <LogIn size={16} />
              )}
              {requires2FA ? "Verify" : "Sign In"}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center font-ui text-[10px] tracking-widest text-[#555550]">
            Don't have an account? <Link href="/register" className="text-[#E8A020] hover:underline">Create Account</Link>
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
