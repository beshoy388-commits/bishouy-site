import { useState, useEffect } from "react";
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const subscribeMutation = trpc.newsletter.subscribe.useMutation({
        onSuccess: () => {
            setIsSubscribed(true);
            setIsLoading(false);
            localStorage.setItem("newsletter_subscribed", "true");
            setTimeout(() => setIsOpen(false), 3000);
        },
        onError: (err) => {
            setIsLoading(false);
            toast.error(err.message || "Subscription failed. Please try again.");
        }
    });

    useEffect(() => {
        const hasSubscribed = localStorage.getItem("newsletter_subscribed");
        const hasDismissed = sessionStorage.getItem("newsletter_dismissed");

        if (!hasSubscribed && !hasDismissed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 15000); // Show after 15 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem("newsletter_dismissed", "true");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        subscribeMutation.mutate({ email });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-[#0F0F0E]/90 backdrop-blur-md" 
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-[#161614] border border-[#2A2A28] rounded-sm overflow-hidden shadow-2xl"
                    >
                        <button 
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-[#555550] hover:text-[#F2F0EB] transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="relative h-48 md:h-auto bg-[#0F0F0E] overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Intelligence Briefing" 
                                    className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161614] via-transparent to-transparent md:bg-gradient-to-r" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                                    <div className="text-center">
                                        <Sparkles className="text-[#E8A020] mx-auto mb-4" size={40} />
                                        <h3 className="font-display text-2xl text-[#F2F0EB] uppercase tracking-tighter">The Intelligence Briefing</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                {!isSubscribed ? (
                                    <>
                                        <div className="mb-8">
                                            <span className="text-[10px] font-black text-[#E8A020] uppercase tracking-[0.3em] block mb-2">Protocol: Subscription</span>
                                            <h2 className="font-display text-3xl text-[#F2F0EB] mb-4 leading-tight text-white">Don't just read the news. <span className="text-[#E8A020]">Understand the connections.</span></h2>
                                            <p className="text-[#8A8880] text-sm leading-relaxed">
                                                Join 45,000+ global analysts receiving our daily neural synthesis of geopolitical and technological shifts.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555550]" size={18} />
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Enter your terminal email..."
                                                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] pl-12 pr-4 py-4 focus:border-[#E8A020] outline-none transition-all placeholder-[#333330] text-sm"
                                                />
                                            </div>
                                            <button 
                                                disabled={isLoading}
                                                className="w-full bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-black uppercase tracking-[0.2em] py-5 rounded-sm transition-all flex items-center justify-center gap-2 group"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <>
                                                        Initialize Subscription
                                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <p className="mt-6 text-[10px] text-[#555550] leading-tight italic">
                                            No spam. Our algorithms only deliver high-fidelity insights. Unsubscribe with a single click at any time.
                                        </p>
                                    </>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-16 h-16 bg-[#E8A020]/10 border border-[#E8A020]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="text-[#E8A020]" size={32} />
                                        </div>
                                        <h2 className="font-display text-2xl text-[#F2F0EB] mb-3">CONNETTED</h2>
                                        <p className="text-[#8A8880] text-sm leading-relaxed">
                                            Your terminal has been successfully synced with our global delivery node. Expect your first briefing at 07:00 AM UTC.
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
