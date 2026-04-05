import { useState, useEffect } from "react";
import { X, Check, ShieldCheck, Zap, ArrowLeft, Settings, CreditCard, AlertTriangle, ChevronRight, Lock, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StripeEmbeddedCheckout from "./StripeEmbeddedCheckout";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function PricingModal({ isOpen, onClose, initialView }: PricingModalProps) {
  const { data: user, isLoading, refetch: refetchUser } = trpc.auth.me.useQuery();
  const [view, setView] = useState<"plans" | "manage" | "payment_update" | "cancel_confirm">(
    initialView || "plans"
  );
  
  const hasUserLoaded = user !== undefined && !isLoading;
  
  useEffect(() => {
    if (isOpen && hasUserLoaded) {
       // Only auto-sync view when modal is freshly opened
       const userTier = user?.subscriptionTier || "free";
       const targetView = initialView || (userTier !== "free" ? "manage" : "plans");
       setView(targetView);
    }
  }, [isOpen]); // Only sync when isOpen changes, not when 'view' or 'initialView' changes

  const [selectedPlan, setSelectedPlan] = useState<string>(
    user?.subscriptionTier !== "free" ? user?.subscriptionTier || "premium" : "premium"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);

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
      toast.info("Plan already active", { description: "You are already utilizing this access level." });
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[92dvh] md:max-h-[90vh] bg-[#11110F] border border-[#2A2A28] rounded-sm shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header Content */}
            <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 border-b border-[#1C1C1A] shrink-0">
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
                 className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] transition-colors border border-transparent hover:border-[#2A2A28]"
               >
                  <X size={18} />
               </button>
            </div>

            {/* View Switching */}
            {view === "manage" && (
              <div className="flex-1 overflow-y-auto p-5 md:p-10 custom-scrollbar">
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
                              <p className="text-[9px] md:text-[10px] text-[#27AE60] font-900 uppercase tracking-widest flex items-center gap-1.5">
                                 <Check size={10} /> Active & Verified Access
                              </p>
                           </div>
                        </div>

                        <div className="flex flex-col justify-end text-left md:text-right">
                            <p className="text-[8px] md:text-[9px] text-[#555550] uppercase tracking-widest font-bold mb-1 underline decoration-[#E8A020]/30 underline-offset-4">
                               Billing Cycle
                            </p>
                            <p className="text-[10px] md:text-xs text-[#F2F0EB] font-900 tracking-widest">MONTHLY AUTO-RENEWAL</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <button 
                          onClick={handlePaymentUpdate}
                          disabled={isProcessing}
                          className="flex items-center justify-between p-4 md:p-5 bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] rounded-sm group transition-all"
                        >
                           <div className="flex items-center gap-4">
                              <CreditCard size={18} className="text-[#8A8880] group-hover:text-[#E8A020] transition-colors" />
                              <div className="text-left">
                                 <p className="text-[9px] md:text-[10px] font-900 text-[#F2F0EB] uppercase tracking-widest mb-0.5">Billing & Payment</p>
                                 <p className="text-[8px] text-[#555550] uppercase tracking-widest">Invoices, Card, History</p>
                              </div>
                           </div>
                           <ChevronRight size={14} className="text-[#2A2A28] group-hover:text-[#8A8880]" />
                        </button>

                        <button 
                          onClick={() => setView("plans")}
                          className="flex items-center justify-between p-4 md:p-5 bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] rounded-sm group transition-all"
                        >
                           <div className="flex items-center gap-4">
                              <Zap size={18} className="text-[#8A8880] group-hover:text-[#E8A020] transition-colors" />
                              <div className="text-left">
                                 <p className="text-[9px] md:text-[10px] font-900 text-[#F2F0EB] uppercase tracking-widest mb-0.5">Change Level</p>
                                 <p className="text-[8px] text-[#555550] uppercase tracking-widest">Compare & Switch Access</p>
                              </div>
                           </div>
                           <ChevronRight size={14} className="text-[#2A2A28] group-hover:text-[#8A8880]" />
                        </button>
                     </div>

                     <div className="mt-8 md:mt-12 flex items-center justify-center">
                        <button 
                          onClick={() => setView("cancel_confirm")}
                          disabled={isProcessing}
                          className="text-[9px] md:text-[10px] font-ui font-900 text-[#555550] hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors py-2 px-4 rounded-sm border border-transparent hover:border-red-500/20 disabled:opacity-30"
                        >
                           <AlertTriangle size={12} />
                           Discontinue Membership
                        </button>
                     </div>
                  </div>
              </div>
            )}

            {view === "cancel_confirm" && (
              <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                  <div className="max-w-md w-full bg-[#0C0C0B] border border-[#1C1C1A] p-8 md:p-10 rounded-sm text-center">
                     <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20">
                        <AlertTriangle size={32} />
                     </div>
                     <h3 className="font-display text-2xl md:text-3xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-4">Confirm Discontinuation?</h3>
                     <p className="font-ui text-[11px] md:text-xs text-[#8A8880] leading-relaxed mb-10 uppercase tracking-wider">
                        You are about to be redirected to the Stripe Billing Portal to manage or cancel your active subscription. 
                        Your access will remain until the end of the current period.
                     </p>
                     
                     <div className="flex flex-col gap-3">
                        <button 
                          onClick={handleCancel}
                          disabled={isProcessing}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-sm font-900 text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                        >
                           {isProcessing ? (
                             <>
                               <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               CONNECTING...
                             </>
                           ) : "UNSUBSCRIBE FROM PLAN"}
                        </button>
                        <button 
                          onClick={() => setView("manage")}
                          disabled={isProcessing}
                          className="w-full bg-[#1C1C1A] hover:bg-[#2A2A28] text-[#8A8880] py-4 rounded-sm font-900 text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                           GO BACK
                        </button>
                     </div>
                  </div>
              </div>
            )}

            {view === "plans" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-5 py-8 md:px-12 md:py-16 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto pb-12 md:pb-6">
                        {PLANS.map((plan) => {
                          const isSelected = selectedPlan === plan.id;
                          const isCurrent = user?.subscriptionTier === plan.id;

                          return (
                            <div 
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan.id)}
                              className={`relative p-6 md:p-10 border rounded-sm transition-all duration-500 cursor-pointer group ${
                                isSelected 
                                  ? 'bg-[#1C1C1A] border-[#E8A020] shadow-[0_0_40px_rgba(232,160,32,0.08)]' 
                                  : 'bg-[#0C0C0B] border-[#1C1C1A] hover:border-[#2A2A28]'
                              }`}
                            >
                               <div className="flex items-center justify-between mb-6 md:mb-8">
                                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${
                                    isSelected ? 'bg-[#E8A020]/20 border-[#E8A020]/40 text-[#E8A020]' : 'bg-[#11110F] border-[#1C1C1A] text-[#8A8880]'
                                  }`}>
                                     {plan.icon}
                                  </div>
                                  {isCurrent && (
                                    <span className="text-[8px] md:text-[9px] bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20 px-2.5 py-1 rounded-sm font-900 tracking-widest uppercase">
                                       Active
                                    </span>
                                  )}
                               </div>

                               <h4 className="font-display text-lg md:text-xl font-900 text-[#F2F0EB] uppercase tracking-widest mb-1 md:mb-2 text-wrap">
                                  {plan.name}
                                </h4>
                               
                               <div className="flex items-baseline gap-2 mb-6 md:mb-8">
                                  <span className="text-2xl md:text-3xl font-serif font-900 text-[#F2F0EB]">{plan.price}</span>
                                  <span className="text-[9px] md:text-[10px] text-[#555550] uppercase tracking-widest font-bold">{plan.period}</span>
                               </div>

                               <div className="space-y-3 md:space-y-4">
                                  {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-3">
                                       <Check size={14} className={isSelected ? 'text-[#E8A020]' : 'text-[#333330]'} />
                                       <span className="text-[9px] md:text-[10px] text-[#8A8880] group-hover:text-[#F2F0EB] transition-colors uppercase tracking-[0.05em] leading-tight flex-1">
                                          {feature}
                                       </span>
                                    </div>
                                  ))}
                               </div>
                               
                               {isSelected && (
                                 <motion.div 
                                   layoutId="selected-ring"
                                   className="absolute -inset-[1px] border-2 border-[#E8A020] rounded-sm pointer-events-none"
                                 />
                               )}
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  {/* Pricing Footer Action */}
                  <div className="shrink-0 p-5 md:p-8 border-t border-[#1C1C1A] bg-[#0C0C0B] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-8">
                     <div className="flex flex-col gap-1 md:gap-1.5 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
                           <div className="flex items-center gap-1.5">
                              <Lock size={10} className="text-[#E8A020]" />
                              <span className="text-[8px] md:text-[9px] text-[#555550] uppercase tracking-widest font-900">Encrypted</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-[#1C1C1A]" />
                           <div className="flex items-center gap-1.5">
                              <ShieldCheck size={10} className="text-[#E8A020]" />
                              <span className="text-[8px] md:text-[9px] text-[#555550] uppercase tracking-widest font-900">Verified</span>
                           </div>
                        </div>
                        <p className="text-[9px] md:text-[10px] text-[#8A8880] uppercase tracking-widest font-bold">
                           Payments secured by Stripe through official gateways.
                        </p>
                      </div>
                      
                      {(!user?.subscriptionTier || user.subscriptionTier === 'free') && selectedPlan === 'premium' && (
                        <div className="mb-4 relative group min-w-[260px]">
                          <input 
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="PROMOTION CODE"
                            className="w-full bg-[#11110F] border border-[#1C1C1A] px-4 py-3 text-[10px] font-900 tracking-widest text-[#F2F0EB] focus:border-[#E8A020]/50 outline-none transition-all placeholder:text-[#333330]"
                          />
                          {couponCode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <span className="text-[8px] text-[#E8A020] font-900 uppercase tracking-tighter">Activated</span>
                              <button onClick={() => setCouponCode("")} className="text-[#555550] hover:text-[#F2F0EB] shadow-none bg-transparent hover:bg-transparent p-0"><X size={10} /></button>
                            </div>
                          )}
                        </div>
                      )}

                      <button 
                       onClick={() => handleUpgrade(selectedPlan)}
                       disabled={isProcessing || selectedPlan === user?.subscriptionTier || (user?.subscriptionTier === 'founder' && selectedPlan === 'premium')}
                       className="w-full md:w-auto bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-8 md:px-10 py-3 md:py-4 rounded-sm font-900 text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                     >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-[#0F0F0E]/30 border-t-[#0F0F0E] rounded-full animate-spin" />
                            SYNC...
                          </span>
                        ) : selectedPlan === user?.subscriptionTier ? "ACTIVE" : (couponCode ? "REDEEM & SUBSCRIBE" : "SUBSCRIBE NOW")}
                     </button>
                  </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showEmbeddedCheckout && (
        <StripeEmbeddedCheckout 
          tier={selectedPlan as "premium" | "founder"} 
          couponCode={couponCode ? couponCode.trim() : undefined}
          onClose={() => { setShowEmbeddedCheckout(false); onClose(); }} 
          onBack={() => setShowEmbeddedCheckout(false)} 
        />
      )}
    </AnimatePresence>
  );
}
