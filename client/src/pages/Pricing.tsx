import * as React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Globe, 
  CreditCard,
  Activity,
  ArrowRight,
  Loader2,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const PLANS = [
  {
    id: "premium" as const,
    name: "Premium Membership",
    price: "€10",
    period: "per month",
    description: "Full access to elite market analytics and investigative reports.",
    trialText: "7-day free trial",
    features: [
      "Access to all Premium articles",
      "Real-time AI Audio Briefings",
      "Advanced AI Article Metrics",
      "0% Ad-Interruption Experience",
      "Save unlimited articles",
      "Priority Notifications"
    ],
    icon: <Zap size={32} className="text-[#E8A020]" />,
    tag: "MOST POPULAR",
    cta: "Start Free Trial"
  },
  {
    id: "founder" as const,
    name: "Founding Member",
    price: "€100",
    period: "per month",
    description: "Direct influence on the BISHOUY roadmap and exclusive governance.",
    trialText: null,
    features: [
      "Full Premium Package",
      "Founder Badge in Discussions",
      "Direct Priority Support",
      "Exclusive Beta Feature Access",
      "Submit Article Requests",
      "Governance Voting Power"
    ],
    icon: <ShieldCheck size={32} className="text-[#E8A020]" />,
    tag: "ELITE ACCESS",
    cta: "Become a Founder"
  }
];

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      toast.error("Payment Error", { description: err.message });
      setIsProcessing(null);
    }
  });

  const handleUpgrade = (tier: "premium" | "founder") => {
    if (!user) {
      setLocation(`/login?redirect=${encodeURIComponent("/pricing")}`);
      return;
    }

    if (user.subscriptionTier === tier) {
       toast.info(`You already have ${tier.toUpperCase()} membership.`);
       return;
    }

    setIsProcessing(tier);
    createCheckoutSession.mutate({ tier });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E] selection:bg-[#E8A020]/30 text-[#F2F0EB]">
      <SEO 
        title="Membership & Access | BISHOUY"
        description="Upgrade your account access. Access elite market analysis, AI briefings, and investigative reports."
      />
      <Navbar />
      
      <main className="pt-20 pb-32 md:pb-20">
        {/* Hero Section */}
        <section className="container px-6 py-16 md:py-24 lg:py-32 relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,#E8A020_0,transparent_70%)] blur-3xl" />
           </div>

           <div className="relative z-10 text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#E8A020]/10 border border-[#E8A020]/20 px-3 py-1 rounded-full mb-6"
              >
                <Activity size={10} className="text-[#E8A020] animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-900 text-[#E8A020] uppercase tracking-widest">Membership Levels</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-6xl lg:text-7xl font-900 text-[#F2F0EB] uppercase tracking-tighter leading-[0.95] mb-8"
              >
                ELEVATE YOUR <br className="hidden md:block" />
                <span className="text-[#E8A020]">ACCESS</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-[#8A8880] font-ui leading-relaxed max-w-2xl mx-auto uppercase tracking-widest font-bold"
              >
                BISHOUY is an elite journalism network. Basic access is free, but high-level 
                strategic analysis and AI-augmented briefings require a paid membership.
              </motion.p>
           </div>

           {/* Pricing Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {PLANS.map((plan, idx) => {
                const isCurrentPlan = user?.subscriptionTier === plan.id;
                return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className={`relative bg-[#11110F] border p-8 md:p-10 lg:p-12 rounded-sm transition-all duration-500 overflow-hidden flex flex-col group ${
                    plan.id === "premium" ? "border-[#E8A020]/30 hover:border-[#E8A020] shadow-[0_0_50px_rgba(232,160,32,0.05)]" : "border-[#2A2A28] hover:border-[#555550]"
                  } ${isCurrentPlan ? "ring-2 ring-[#E8A020]/50" : ""}`}
                >
                   {isCurrentPlan && (
                     <div className="absolute top-0 right-0">
                       <div className="bg-[#27AE60] text-white text-[8px] font-900 uppercase tracking-widest px-3 py-1.5 rounded-bl-sm flex items-center gap-1">
                         <Check size={8} /> ACTIVE
                       </div>
                     </div>
                   )}
                   
                   {!isCurrentPlan && (
                     <div className="absolute top-6 right-8 md:right-10 text-[9px] md:text-[10px] font-900 text-[#555550] uppercase tracking-widest">
                        {plan.tag}
                     </div>
                   )}

                   <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-[#1C1C1A] flex items-center justify-center border border-[#2A2A28] mb-8 md:mb-10 group-hover:scale-110 transition-transform duration-500">
                      {plan.icon}
                   </div>

                   <h3 className="font-display text-2xl md:text-3xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-4">
                      {plan.name}
                   </h3>
                   
                   <p className="text-xs md:text-sm text-[#8A8880] mb-6 leading-relaxed font-ui uppercase tracking-widest font-bold">
                      {plan.description}
                   </p>

                   <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl md:text-5xl font-serif font-900 text-[#F2F0EB]">{plan.price}</span>
                      <span className="text-[10px] md:text-xs text-[#555550] uppercase tracking-widest font-bold">{plan.period}</span>
                   </div>

                   {plan.trialText && !isCurrentPlan && (
                     <div className="flex items-center gap-2 mb-8">
                       <Gift size={14} className="text-[#27AE60]" />
                       <span className="text-[11px] text-[#27AE60] font-900 uppercase tracking-widest">
                         {plan.trialText}
                       </span>
                     </div>
                   )}
                   {!plan.trialText && <div className="mb-8" />}

                   <div className="h-px bg-[#222220] mb-10" />

                   <ul className="space-y-4 mb-12 flex-1">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                           <Check size={16} className="text-[#E8A020] shrink-0 mt-0.5" />
                           <span className="text-[11px] md:text-xs text-[#F2F0EB]/80 font-ui uppercase tracking-widest leading-none font-bold">{feature}</span>
                        </li>
                      ))}
                   </ul>

                   <button
                     onClick={() => handleUpgrade(plan.id)}
                     disabled={!!isProcessing || isCurrentPlan}
                     className={`w-full py-4 md:py-5 rounded-sm font-ui text-[10px] md:text-xs font-900 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
                       plan.id === "premium" 
                        ? "bg-[#E8A020] text-[#0F0F0E] hover:bg-[#D4911C] shadow-lg shadow-[#E8A020]/10" 
                        : "border border-[#2A2A28] text-[#8A8880] hover:text-[#F2F0EB] hover:border-[#555550]"
                     }`}
                   >
                      <AnimatePresence mode="wait">
                        {isProcessing === plan.id ? (
                          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} />
                            Redirecting to Checkout...
                          </motion.div>
                        ) : isCurrentPlan ? (
                          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <Check size={14} /> Current Plan
                          </motion.div>
                        ) : (
                          <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            {plan.cta}
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </button>
                </motion.div>
              );
              })}
           </div>

           {/* Payment Methods */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="mt-16 md:mt-24 flex flex-col items-center justify-center"
           >
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-6">
                 <div className="flex items-center gap-2 bg-[#1C1C1A] border border-[#2A2A28] px-3 py-1.5 rounded-sm">
                    <CreditCard size={12} className="text-[#8A8880]" />
                    <span className="text-[8px] md:text-[9px] text-[#8A8880] uppercase tracking-widest font-bold">Cards</span>
                 </div>
                 <div className="flex items-center gap-2 bg-[#1C1C1A] border border-[#2A2A28] px-3 py-1.5 rounded-sm">
                    <span className="text-[10px] text-[#8A8880]">🍎</span>
                    <span className="text-[8px] md:text-[9px] text-[#8A8880] uppercase tracking-widest font-bold">Apple Pay</span>
                 </div>
                 <div className="flex items-center gap-2 bg-[#1C1C1A] border border-[#2A2A28] px-3 py-1.5 rounded-sm">
                    <Globe size={12} className="text-[#8A8880]" />
                    <span className="text-[8px] md:text-[9px] text-[#8A8880] uppercase tracking-widest font-bold">Google Pay</span>
                 </div>
              </div>
              <p className="text-[9px] md:text-[10px] text-[#555550] uppercase tracking-[0.3em] font-900 max-w-sm md:max-w-md text-center leading-loose px-6 flex items-center gap-2">
                 <Lock size={10} className="shrink-0" />
                 Payments secured by Stripe · 256-bit SSL
              </p>
           </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[#11110F] border-y border-[#1C1C1A] py-16 md:py-24 lg:py-32">
           <div className="container max-w-4xl px-6">
              <h2 className="font-display text-3xl md:text-4xl text-[#F2F0EB] uppercase tracking-tighter mb-12 md:mb-16 text-center">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-widest">Is there a free trial?</h4>
                     <p className="text-xs text-[#8A8880] leading-relaxed italic opacity-80 font-ui uppercase tracking-widest font-bold">
                        "Yes! Premium Membership includes a 7-day free trial for new subscribers. You won't be charged until the trial period ends. Cancel anytime."
                     </p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-widest">Can I use a discount code?</h4>
                     <p className="text-xs text-[#8A8880] leading-relaxed italic opacity-80 font-ui uppercase tracking-widest font-bold">
                        "Yes. During checkout you can enter any valid promotion code. Discounts are applied automatically to your subscription."
                     </p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-widest">What payment methods are accepted?</h4>
                     <p className="text-xs text-[#8A8880] leading-relaxed italic opacity-80 font-ui uppercase tracking-widest font-bold">
                        "We accept all major credit/debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay."
                     </p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-widest">Can I cancel anytime?</h4>
                     <p className="text-xs text-[#8A8880] leading-relaxed italic opacity-80 font-ui uppercase tracking-widest font-bold">
                        "Yes. Manage or cancel your subscription from your Profile page. Changes take effect at the end of your billing cycle."
                     </p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
