import { useState, useEffect } from "react";
import { X, Check, ShieldCheck, Zap, ArrowLeft, Settings, CreditCard, AlertTriangle, ChevronRight, Lock, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StripeEmbeddedCheckout from "./StripeEmbeddedCheckout";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; 
  initialView?: "plans" | "manage" | "payment_update" | "cancel_confirm";
}

const PLANS = [
  {
    id: "premium",
    name: "Premium Membership",
    price: "€10",
    period: "per month",
    features: [
      "Access to all Premium articles",
      "7-Day Free Trial (First-time members)",
      "Standard Pricing: €10/mo",
      "Real-time AI Audio Briefings",
      "Advanced AI Article Metrics",
      "0% Ad-Interruption Experience",
      "Promotion Codes supported"
    ],
    icon: <Zap size={20} className="text-[#E8A020]" />,
    color: "#E8A020"
  },
  {
    id: "founder",
    name: "Founding Member",
    price: "€100",
    period: "per month",
    features: [
      "Full Premium Package",
      "Founder Badge in Discussions",
      "Direct Priority Support",
      "Exclusive Beta Feature Access",
      "Submit Article Requests",
      "Governance Voting Power"
    ],
    icon: <ShieldCheck size={20} className="text-[#E8A020]" />,
    color: "#E8A020"
  }
];

export default function PricingModal({ isOpen, onClose, user, initialView }: PricingModalProps) {
  const [view, setView] = useState<"plans" | "manage" | "payment_update" | "cancel_confirm">(
    initialView || "plans"
  );
  
  useEffect(() => {
    if (isOpen && user) {
       const userTier = user?.subscriptionTier || "free";
       const targetView = initialView || (userTier !== "free" ? "manage" : "plans");
       setView(targetView);
    }
  }, [isOpen]);

  const [selectedPlan, setSelectedPlan] = useState<string>(
    user?.subscriptionTier !== "free" ? user?.subscriptionTier || "premium" : "premium"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);

  const utils = trpc.useUtils();

  const createPortalSession = trpc.stripe.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "PORTAL ERROR");
      setIsProcessing(false);
    }
  });

  const handleUpgrade = (planId: string) => {
    if (user?.subscriptionTier === planId) {
      toast.info("Plan already active");
      return;
    }
    setShowEmbeddedCheckout(true);
  };

  const handleCancel = () => {
    setIsProcessing(true);
    createPortalSession.mutate();
  };

  const handlePaymentUpdate = () => {
    setIsProcessing(true);
    createPortalSession.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-6 overflow-hidden">
      {/* Background Overlay - Simplified */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />
      
      <div className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] max-w-4xl bg-[#11110F] border-0 md:border md:border-[#2A2A28] rounded-none md:rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:pt-5 md:px-6 md:py-5 border-b border-[#1C1C1A] shrink-0 bg-[#11110F] z-10">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8A020]/10 flex items-center justify-center border border-[#E8A020]/20">
                 <Settings size={14} className="text-[#E8A020]" />
              </div>
              <h2 className="font-display text-sm md:text-base font-900 text-[#F2F0EB] uppercase tracking-widest">
                 {view === 'manage' ? 'Subscription Control' : 'Upgrade Access'}
              </h2>
           </div>
           <button 
             onClick={onClose}
             className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
           >
              <X size={18} />
           </button>
        </div>

        <AnimatePresence mode="wait">
          {view === "manage" && (
            <motion.div 
              key="manage"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto p-5 pb-[env(safe-area-inset-bottom)] md:p-10 custom-scrollbar"
            >
                <div className="max-w-2xl mx-auto">
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 bg-[#0C0C0B] border border-[#1C1C1A] rounded-sm mb-8 md:mb-10">
                      <div className="flex items-center gap-4 md:gap-5">
                         <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E8A020]/10 flex items-center justify-center text-[#E8A020] border border-[#E8A020]/20">
                            {user?.subscriptionTier === 'founder' ? <ShieldCheck size={28} /> : <Zap size={28} />}
                         </div>
                         <div>
                            <h3 className="font-display text-lg md:text-2xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-1">
                               {user?.subscriptionTier === 'founder' ? 'Founding Member' : 'Premium Membership'}
                            </h3>
                            <p className="text-[9px] md:text-[10px] text-[#27AE60] font-900 uppercase tracking-widest">Active & Verified Access</p>
                         </div>
                      </div>
                      <div className="flex flex-col text-left md:text-right uppercase tracking-widest text-[9px] font-bold text-[#555550]">
                          MONTHLY AUTO-RENEWAL
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <button 
                        onClick={handlePaymentUpdate}
                        disabled={isProcessing}
                        className="flex items-center justify-between p-5 md:p-5 bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] rounded-sm transition-all active:scale-[0.98]"
                      >
                         <div className="flex items-center gap-4">
                            <CreditCard size={20} className="text-[#8A8880]" />
                            <div className="text-left">
                               <p className="text-[10px] md:text-[10px] font-900 text-[#F2F0EB] uppercase tracking-widest">Billing & Payment</p>
                               <p className="text-[9px] md:text-[8px] text-[#555550] uppercase tracking-widest mt-0.5">Invoices & Card</p>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-[#2A2A28]" />
                      </button>

                      <button 
                        onClick={() => setView("plans")}
                        className="flex items-center justify-between p-5 md:p-5 bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] rounded-sm transition-all active:scale-[0.98]"
                      >
                         <div className="flex items-center gap-4">
                            <Zap size={20} className="text-[#8A8880]" />
                            <div className="text-left">
                               <p className="text-[10px] md:text-[10px] font-900 text-[#F2F0EB] uppercase tracking-widest">Change Level</p>
                               <p className="text-[9px] md:text-[8px] text-[#555550] uppercase tracking-widest mt-0.5">Switch Access</p>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-[#2A2A28]" />
                      </button>
                   </div>

                   <div className="mt-8 flex items-center justify-center">
                      <button onClick={() => setView("cancel_confirm")} className="text-[9px] text-[#555550] hover:text-red-500 uppercase tracking-widest py-2">
                         Discontinue Membership
                      </button>
                   </div>
                </div>
            </motion.div>
          )}

          {view === "plans" && (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto px-5 py-8 md:px-12 md:py-16 custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto pb-12">
                      {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        return (
                          <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative p-6 md:p-10 border rounded-sm transition-all cursor-pointer ${
                              isSelected ? 'bg-[#1C1C1A]' : 'bg-[#0C0C0B] border-[#1C1C1A]'
                            }`}
                          >
                             {isSelected && (
                               <motion.div 
                                 layoutId="selected-ring"
                                 className="absolute inset-[-1px] border-2 border-[#E8A020] rounded-sm pointer-events-none z-10"
                                 transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                               />
                             )}
                             <h4 className="font-display text-lg md:text-xl font-900 text-[#F2F0EB] uppercase tracking-widest mb-4">{plan.name}</h4>
                             <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-2xl md:text-3xl font-serif font-900 text-[#F2F0EB]">{plan.price}</span>
                                <span className="text-[10px] text-[#555550] uppercase font-bold tracking-widest">{plan.period}</span>
                             </div>
                             <div className="space-y-3 relative z-20">
                                {plan.features.map((feature, fIdx) => (
                                  <div key={fIdx} className="flex items-start gap-3">
                                     <Check size={14} className={isSelected ? 'text-[#E8A020]' : 'text-[#333330]'} />
                                     <span className="text-[10px] text-[#8A8880] uppercase tracking-widest leading-tight">{feature}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="shrink-0 p-5 md:p-8 border-t border-[#1C1C1A] bg-[#0C0C0B] flex flex-col md:flex-row items-center justify-between gap-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                      <p className="text-[10px] text-[#8A8880] uppercase tracking-widest font-bold">Payments secured by Stripe official gateways.</p>
                    </div>
                    <button 
                     onClick={() => handleUpgrade(selectedPlan)}
                     disabled={isProcessing || selectedPlan === user?.subscriptionTier}
                     className="w-full md:w-auto bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-10 py-5 md:py-4 font-900 text-[12px] md:text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl active:scale-[0.98]"
                    >
                      {isProcessing ? "SYNCING..." : (selectedPlan === user?.subscriptionTier ? "ACTIVE" : "SUBSCRIBE NOW")}
                   </button>
                </div>
            </motion.div>
          )}

          {view === "cancel_confirm" && (
             <motion.div 
               key="cancel"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="flex-1 flex items-center justify-center p-8 md:p-12 pb-[env(safe-area-inset-bottom)]"
             >
                <div className="max-w-md w-full text-center">
                   <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
                   <h3 className="text-2xl md:text-3xl font-900 text-[#F2F0EB] uppercase mb-4 tracking-tighter">Confirm?</h3>
                   <p className="text-[11px] md:text-[12px] text-[#8A8880] uppercase mb-10 leading-relaxed max-w-[250px] mx-auto md:max-w-none">You will be redirected to the Billing Portal.</p>
                   <button onClick={handleCancel} className="w-full bg-red-600 hover:bg-red-700 text-white py-5 md:py-4 font-900 uppercase text-[11px] md:text-[10px] tracking-widest mb-4 shadow-xl active:scale-[0.98] transition-transform">TERMINATE MEMBERSHIP</button>
                   <button onClick={() => setView("manage")} className="w-full bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] py-5 md:py-4 font-900 uppercase text-[11px] md:text-[10px] tracking-widest active:scale-[0.98] transition-all">BACK</button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showEmbeddedCheckout && (
        <StripeEmbeddedCheckout 
          tier={selectedPlan as "premium" | "founder"} 
          couponCode={couponCode ? couponCode.trim() : undefined}
          onClose={() => { setShowEmbeddedCheckout(false); onClose(); }} 
          onBack={() => setShowEmbeddedCheckout(false)} 
        />
      )}
    </div>
  );
}
