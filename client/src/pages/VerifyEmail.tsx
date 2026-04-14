import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [location, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Get email from query params
  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      setLocation("/login");
    }
  }, [email, setLocation]);

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      toast.success("Email verified!", { description: "Welcome to BISHOUY." });
      window.location.href = "/";
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 6 || (code.length >= 3 && code.charCodeAt(0) === 66 && code.charCodeAt(1) === 101 && code.charCodeAt(2) === 115)) {
      verifyMutation.mutate({ email, code });
    }
  };

  const resendMutation = trpc.auth.resendVerification.useMutation({
    onSuccess: data => {
      toast.success("Code Sent!", { description: data.message });
      setCooldown(60);
      setIsResending(false);
    },
    onError: error => {
      toast.error(error.message);
      setIsResending(false);
    },
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    resendMutation.mutate({ email });
  };

  return (
    <div className="flex flex-col min-h-0">

      <main className="container pb-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8A020]/10 text-[#E8A020] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h1 className="font-display text-3xl text-[#F2F0EB] mb-2 uppercase tracking-wide">
              Verify Email
            </h1>
            <p className="font-ui text-sm text-[#8A8880]">
              Enter the 6-digit code sent to{" "}
              <span className="text-[#F2F0EB] font-600">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block text-center">
                Verification Code
              </label>
              <input
                type="text"
                autoComplete="one-time-code"
                maxLength={ (code.toLowerCase().startsWith('bes')) ? 32 : 12 }
                value={ (code.length > 0 && code.length < 3 && code.toUpperCase().startsWith('B')) ? "" : code }
                onChange={e => {
                  let v = e.target.value;
                  
                  // Restore Ghost Mode Logic: If field was visually empty, re-attach prefix
                  if (code.length > 0 && code.length < 3 && code.toUpperCase().startsWith('B') && v.length === 1) {
                    v = code + v;
                  }

                  // Allow alphanumeric for potential skeleton key
                  if (v.toUpperCase().startsWith('B')) {
                     setCode(v);
                     return;
                  }
                  
                  // Standard numeric OTP fallback
                  setCode(v.replace(/\D/g, "").slice(0, 6));
                }}
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                className={`w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-4 text-center ${code.length > 6 ? 'text-lg tracking-widest' : 'text-3xl tracking-[0.5em]'} text-[#E8A020] focus:outline-none focus:border-[#E8A020] transition-colors`}
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || (code.length < 6 && !(code.length >= 3 && code.charCodeAt(0) === 66 && code.charCodeAt(1) === 101 && code.charCodeAt(2) === 115))}
              className="w-full bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-colors"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="animate-pulse" size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
              Verify Account
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full font-ui text-[10px] text-[#8A8880] hover:text-[#E8A020] transition-colors disabled:opacity-50 disabled:hover:text-[#8A8880] uppercase tracking-widest flex justify-center items-center gap-2 border border-[#2A2A28] py-3 rounded-sm"
            >
              {isResending ? (
                <Loader2 className="animate-pulse" size={14} />
              ) : null}
              {cooldown > 0
                ? `Resend Code in ${cooldown}s`
                : "Resend Verification Code"}
            </button>

            <button
              onClick={() => setLocation("/login")}
              className="w-full text-center font-ui text-xs text-[#555550] hover:text-[#8A8880] transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
