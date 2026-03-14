import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-[#11110F] border border-[#2A2A28] rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Security Banner */}
                    <div className={`h-2 w-full ${isBanned || isDeleted ? 'bg-red-500' : isRestricted ? 'bg-blue-500' : 'bg-green-500'}`} />
                    
                    <div className="p-8 md:p-12 text-center">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center border-4 ${
                            isBanned || isDeleted ? 'border-red-500/20 bg-red-500/10' : 
                            isRestricted ? 'border-blue-500/20 bg-blue-500/10' : 
                            'border-green-500/20 bg-green-500/10'
                        }`}>
                            {isBanned || isDeleted ? <Lock className="text-red-500" size={32} /> : 
                             isRestricted ? <AlertTriangle className="text-blue-500" size={32} /> : 
                             <Shield className="text-green-500" size={32} />}
                        </div>

                        <h2 className="font-headline text-3xl text-[#F2F0EB] mb-4 uppercase tracking-tighter">
                            Official Account Status <span className={isBanned || isDeleted ? 'text-red-500' : isRestricted ? 'text-blue-500' : 'text-green-500'}>Updated</span>
                        </h2>

                        <div className="bg-[#0A0A09] border border-[#1C1C1A] p-6 rounded-xl mb-8 text-left">
                            <p className="text-[10px] text-[#555550] uppercase tracking-widest font-900 mb-3">Formal communication from administration:</p>
                            <p className="text-[#D4D0C8] font-ui leading-relaxed text-sm italic">
                                "{localUser.statusMessage}"
                            </p>
                        </div>

                        <p className="text-[#8A8880] text-[11px] font-ui uppercase tracking-widest leading-relaxed mb-10 max-w-md mx-auto">
                            {isBanned 
                                ? "Your access to the platform has been terminated immediately. This decision is final and documented in our security audit logs." 
                                : isDeleted
                                ? "Your account and all associated data are scheduled for permanent removal. Confirming will physically wipe your records from our systems."
                                : isRestricted 
                                ? "You may continue to browse the site, but your ability to interact, comment, and use AI features has been suspended for the reason stated above."
                                : "Your account privileges have been restored. You can now resume full interaction with the site features."}
                        </p>

                        <button
                            onClick={handleAction}
                            disabled={isPending}
                            className={`w-full py-4 rounded-xl font-headline text-sm uppercase tracking-widest font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait ${
                                isBanned || isDeleted
                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20' 
                                : isRestricted 
                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                                : 'bg-[#E8A020] text-[#0F0F0E] hover:bg-[#F0A830] shadow-lg shadow-[#E8A020]/20'
                            }`}
                        >
                            {isPending ? "Processing Official Record..." : (isBanned ? "Log Out & Terminate Session" : isDeleted ? "Confirm & Wipe All My Data" : "Confirm Recognition")}
                        </button>
                    </div>
                    
                    {/* Legal Footer */}
                    <div className="px-8 py-4 bg-[#0A0A09] border-t border-[#1C1C1A] flex justify-between items-center text-[8px] text-[#333330] uppercase tracking-widest font-bold">
                        <span>Ref: SEC-NODE-{localUser.id}-{Date.now().toString().slice(-4)}</span>
                        <span>Digital Signature Verified</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
