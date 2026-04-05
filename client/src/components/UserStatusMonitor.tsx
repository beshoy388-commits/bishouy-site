import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, CheckCircle, X, Shield, Lock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserStatusMonitor() {
    const { user, isAuthenticated, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [localUser, setLocalUser] = useState<any>(null);

    // Poll status every 10 seconds only if authenticated
    const { data: me } = trpc.users.getMe.useQuery(undefined, {
        enabled: isAuthenticated,
        refetchInterval: 10000,
        staleTime: 5000,
    });

    const acknowledgeMutation = trpc.users.acknowledgeNotification.useMutation({
        onSuccess: () => {
            setShowModal(false);
        }
    });

    const purgeMeMutation = trpc.users.purgeMe.useMutation({
        onSuccess: () => {
            setShowModal(false);
            window.location.href = "/";
        }
    });

    useEffect(() => {
        if (me && me.statusMessage && me.statusNotificationRead === 0) {
            setLocalUser(me);
            setShowModal(true);
        }
    }, [me]);

    const handleAcknowledge = () => {
        acknowledgeMutation.mutate();
    };

    const handleAction = () => {
        if (localUser?.status === 'banned') {
            logout();
        } else if (localUser?.status === 'deleted') {
            purgeMeMutation.mutate();
        } else {
            handleAcknowledge();
        }
    };

    if (!showModal || !localUser) return null;

    const isBanned = localUser.status === 'banned';
    const isDeleted = localUser.status === 'deleted';
    const isRestricted = localUser.status === 'restricted';
    const isActive = localUser.status === 'active';

    const isPending = acknowledgeMutation.isPending || purgeMeMutation.isPending;

    const securityId = useMemo(() => Date.now().toString().slice(-4), []);

    return (
        <AnimatePresence>
            {showModal && localUser && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isBanned && !isDeleted && setShowModal(false)}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-[#11110F] border border-[#222220] rounded-sm shadow-2xl overflow-hidden translate-z-0 transform-gpu"
                    >
                        {/* Status Bar */}
                        <div className={`h-1 w-full ${isBanned || isDeleted ? 'bg-red-500' : isRestricted ? 'bg-blue-500' : 'bg-green-500'}`} />
                        
                        {/* Top Close Button - Critical UX improvement */}
                        {!isBanned && !isDeleted && (
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 text-[#555550] hover:text-[#F2F0EB] transition-colors z-20"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="p-8 md:p-12 text-center">
                            <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center border-2 ${
                                isBanned || isDeleted ? 'border-red-500/20 bg-red-500/10' : 
                                isRestricted ? 'border-blue-500/20 bg-blue-500/10' : 
                                'border-green-500/20 bg-green-500/10'
                            }`}>
                                {isBanned || isDeleted ? <Lock className="text-red-500" size={32} /> : 
                                 isRestricted ? <AlertTriangle className="text-blue-500" size={32} /> : 
                                 <Shield className="text-green-500" size={32} />}
                            </div>

                            <h2 className="font-display text-2xl md:text-3xl text-[#F2F0EB] mb-4 uppercase tracking-tighter">
                                Account Status: <span className={isBanned || isDeleted ? 'text-red-500' : isRestricted ? 'text-blue-500' : 'text-green-500'}>Updated</span>
                            </h2>

                            <div className="bg-[#0A0A09] border border-[#1C1C1A] p-6 rounded-sm mb-8 text-left relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#E8A020]/20" />
                                <p className="text-[9px] text-[#555550] uppercase tracking-widest font-900 mb-3">Official communication from administration:</p>
                                <p className="text-[#D4D0C8] font-ui leading-relaxed text-sm italic">
                                    "{localUser.statusMessage}"
                                </p>
                            </div>

                            <p className="text-[#8A8880] text-[10px] font-ui uppercase tracking-widest leading-relaxed mb-10 max-w-md mx-auto">
                                {isBanned 
                                    ? "Platform access has been terminated immediately. This decision is final and documented in security logs." 
                                    : isDeleted
                                    ? "Your account and all associated data are scheduled for permanent removal. Confirmation will physically delete your records from our systems."
                                    : isRestricted 
                                    ? "You can continue to browse the site, but your ability to interact, comment, and use AI features remains suspended."
                                    : "Your account privileges have been restored. Your interaction features are now active."}
                            </p>

                            <button
                                onClick={handleAction}
                                disabled={isPending}
                                className={`w-full py-4 rounded-sm font-ui text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 disabled:cursor-wait ${
                                    isBanned || isDeleted
                                    ? 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-600/20' 
                                    : isRestricted 
                                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
                                    : 'bg-[#F2F0EB] text-[#0F0F0E] hover:bg-[#E8A020] shadow-xl shadow-white/10'
                                }`}
                            >
                                {isPending ? "Processing Official Record..." : (isBanned ? "Log Out & Terminate Session" : isDeleted ? "Confirm & Delete All Data" : "Acknowledge Status")}
                            </button>
                        </div>
                        
                        <div className="px-8 py-4 bg-[#0A0A09] border-t border-[#1C1C1A] flex justify-between items-center text-[7px] text-[#333330] uppercase tracking-widest font-bold">
                            <span>Rif: SEC-NODE-{localUser.id}-{securityId}</span>
                            <span>Digital Signature Verified</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
