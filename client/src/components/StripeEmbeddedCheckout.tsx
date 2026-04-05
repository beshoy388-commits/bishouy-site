import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldCheck, ArrowLeft, X, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeEmbeddedCheckoutProps {
  tier: "premium" | "founder";
  couponCode?: string;
  onClose: () => void;
  onBack: () => void;
}

export default function StripeEmbeddedCheckout({ tier, couponCode, onClose, onBack }: StripeEmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (err) => {
      setError(err.message || "Failed to initialize payment.");
    }
  });

  useEffect(() => {
    createCheckoutSession.mutate({ tier, couponCode, uiMode: "embedded_page" });
  }, [tier, couponCode]);

  const planInfo = tier === "premium" 
    ? { name: "Premium Membership", price: "€10/mo", icon: <Zap size={20} />, trial: true }
    : { name: "Founding Member", price: "€100/mo", icon: <ShieldCheck size={20} />, trial: false };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-md z-10"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full h-full md:h-[95vh] md:max-w-2xl bg-[#0F0F0E] md:border md:border-[#E8A020]/20 md:rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_30px_rgba(232,160,32,0.08)] flex flex-col overflow-hidden z-20"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A28] shrink-0 bg-[#0F0F0E]/95 backdrop-blur-sm z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] transition-colors border border-transparent hover:border-[#E8A020]/20"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#E8A020]/10 flex items-center justify-center text-[#E8A020]">
                {planInfo.icon}
              </div>
              <div>
                <h2 className="font-display text-xs md:text-sm font-900 text-[#F2F0EB] uppercase tracking-[0.15em]">
                  {planInfo.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#E8A020] font-900 tracking-widest">{planInfo.price}</span>
                  {planInfo.trial && (
                    <span className="text-[8px] bg-[#27AE60]/10 text-[#27AE60] px-1.5 py-0.5 rounded-sm font-900 tracking-wider border border-[#27AE60]/20">
                      7 DAYS FREE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] transition-colors border border-[#2A2A28] hover:border-[#E8A020]/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Checkout Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#0F0F0E]">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 text-red-500 mb-6">
                <X size={32} />
              </div>
              <h3 className="text-lg font-900 text-[#F2F0EB] uppercase tracking-tighter mb-2">Payment Error</h3>
              <p className="text-xs text-[#8A8880] text-center max-w-sm mb-6">{error}</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-[#E8A020] text-[#0F0F0E] rounded-sm text-[10px] font-900 uppercase tracking-widest hover:bg-[#D4911C] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !clientSecret ? (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#0F0F0E]">
              <Loader2 className="animate-spin text-[#E8A020] mb-4" size={32} />
              <p className="text-xs text-[#8A8880] uppercase tracking-widest font-bold">
                Initializing secure checkout...
              </p>
            </div>
          ) : (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout className="stripe-embedded-checkout" />
            </EmbeddedCheckoutProvider>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2A2A28] bg-[#0F0F0E] shrink-0 flex items-center justify-center gap-2">
          <Lock size={10} className="text-[#333330]" />
          <span className="text-[8px] text-[#333330] uppercase tracking-[0.2em] font-bold">
            Secured by Stripe · PCI Level 1 Certified · 256-bit SSL
          </span>
        </div>
      </motion.div>
    </div>
  );
}
