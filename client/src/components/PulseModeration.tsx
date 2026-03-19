import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, X, AlertCircle, Bot, Trash2, ShieldX, ScanEye, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

export default function PulseModeration() {
    const adminListQuery = trpc.social.adminList.useQuery({ status: "flagged" }, {
        refetchInterval: 5000
    });

    const updateStatusMutation = trpc.social.updateStatus.useMutation({
        onSuccess: () => {
            adminListQuery.refetch();
            toast.success("Moderation decision recorded.");
        }
    });

    const deleteMutation = trpc.social.delete.useMutation({
        onSuccess: () => {
            adminListQuery.refetch();
            toast.success("Post deleted.");
        }
    });

    const handleDecision = (id: number, status: "approved" | "rejected") => {
        updateStatusMutation.mutate({ id, status });
    };

    return (
        <div className="space-y-10 animate-fade-in relative pb-10">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-[#1C1C1A] pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-sm">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-ui">Protocol: Scrutiny</span>
                         </div>
                    </div>
                    <h2 className="text-4xl font-display text-[#F2F0EB] tracking-tighter uppercase leading-[0.8] mt-4">AI <span className="text-red-500">QUARANTINE</span> Zone</h2>
                    <p className="text-[#555550] text-[10px] font-black uppercase tracking-[0.3em] font-ui">Awaiting executive override on flagged community nodes</p>
                </div>
                
                <div className="p-6 bg-[#11110F] border border-[#1C1C1A] relative overflow-hidden flex flex-col items-end">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                         <span className="text-2xl font-display text-[#F2F0EB]">{adminListQuery.data?.length || 0}</span>
                    </div>
                    <p className="text-[9px] font-black text-[#555550] uppercase tracking-widest font-ui">Flagged Signals</p>
                </div>
            </div>

            <div className="grid gap-6">
                {adminListQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-30">
                        <ScanEye size={40} className="animate-pulse text-[#E8A020]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] font-ui">Syncing Intel Layer...</p>
                    </div>
                ) : adminListQuery.data?.length === 0 ? (
                    <Card className="bg-[#11110F] border-[#1C1C1A] border-dashed p-40 text-center group translate-z-0">
                        <div className="absolute inset-0 bg-[#E8A020]/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Bot size={60} className="mx-auto mb-6 text-[#1C1C1A] group-hover:text-[#E8A020]/20 transition-colors" />
                        <p className="text-[#555550] uppercase text-[10px] font-black tracking-[0.4em] font-ui">Environment Optimal. No threats detected.</p>
                    </Card>
                ) : (
                    adminListQuery.data?.map((post, idx) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="bg-[#11110F] border border-[#1C1C1A] overflow-hidden group hover:border-red-500/30 transition-all shadow-2xl">
                                <div className="p-8 flex flex-col xl:flex-row gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#E8A020]/5 border border-[#1C1C1A] flex items-center justify-center font-display text-[#E8A020] text-xl">
                                                    {post.authorName?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-[#F2F0EB] uppercase tracking-widest font-ui">{post.authorName}</span>
                                                    <span className="text-[9px] uppercase font-black text-[#333330] tracking-tighter">
                                                        Pulse Detected: {formatDistanceToNow(new Date(post.createdAt))} AGO
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-red-500/5 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest font-ui flex items-center gap-2">
                                                <ShieldX size={10} /> THREAT_LEVEL: HIGH
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-500/20" />
                                            <p className="text-sm font-ui text-[#D4D0C8] bg-[#0A0A09] p-6 border border-[#1C1C1A] italic whitespace-pre-wrap leading-relaxed shadow-inner">
                                                "{post.content}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between px-1">
                                                    <span className="text-[9px] font-black text-[#555550] uppercase tracking-widest font-ui flex items-center gap-2">
                                                        <Zap size={10} className="text-[#E8A020]" /> AI TOXICITY SENSOR
                                                    </span>
                                                    <span className="text-[10px] font-black text-red-500 font-display tracking-tighter">{post.aiScore}%</span>
                                                </div>
                                                <div className="h-[2px] w-full bg-[#1C1C1A] overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${post.aiScore}%` }}
                                                        transition={{ duration: 1 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-[8px] font-black text-[#333330] uppercase tracking-widest font-ui mb-2">REASON_LOG:</p>
                                                 <p className="text-[10px] font-black text-[#8A8880] uppercase tracking-tighter italic">
                                                    {post.aiReason || 'NEURAL_ANALYSIS_IN_PROGRESS...'}
                                                 </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row xl:flex-col gap-[2px] bg-[#1C1C1A] border border-[#1C1C1A] xl:w-56 h-fit shrink-0 overflow-hidden shadow-2xl">
                                        <button
                                            onClick={() => handleDecision(post.id, 'approved')}
                                            disabled={updateStatusMutation.isPending}
                                            className="grow p-6 bg-[#11110F] text-green-500 hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest font-ui z-10"
                                        >
                                            <Check size={16} /> <span className="hidden sm:inline">Clearance</span>
                                        </button>
                                        <button
                                            onClick={() => handleDecision(post.id, 'rejected')}
                                            disabled={updateStatusMutation.isPending}
                                            className="grow p-6 bg-[#11110F] text-red-500 hover:bg-red-500 hover:text-black transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest font-ui z-10"
                                        >
                                            <X size={16} /> <span className="hidden sm:inline">Purge</span>
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate({ id: post.id })}
                                            disabled={deleteMutation.isPending}
                                            className="p-6 bg-[#11110F] text-[#333330] hover:text-white transition-all border-l xl:border-l-0 xl:border-t border-[#1C1C1A] z-10"
                                            title="Terminate Dossier"
                                        >
                                            <Trash2 size={16} className="mx-auto" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
