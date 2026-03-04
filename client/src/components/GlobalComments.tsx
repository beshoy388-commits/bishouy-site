import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, X, Trash2, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function GlobalComments() {
    const [filter, setFilter] = useState<"pending" | "all">("pending");

    const pendingQuery = trpc.comments.getPending.useQuery();
    const allQuery = trpc.comments.getAll.useQuery(undefined, {
        enabled: filter === "all"
    });

    const utils = trpc.useUtils();

    const approveMutation = trpc.comments.approve.useMutation({
        onSuccess: () => {
            toast.success("Comment approved");
            utils.comments.getPending.invalidate();
            utils.comments.getAll.invalidate();
        }
    });

    const rejectMutation = trpc.comments.reject.useMutation({
        onSuccess: () => {
            toast.success("Comment rejected");
            utils.comments.getPending.invalidate();
            utils.comments.getAll.invalidate();
        }
    });

    const deleteMutation = trpc.comments.delete.useMutation({
        onSuccess: () => {
            toast.success("Comment permanently deleted");
            utils.comments.getPending.invalidate();
            utils.comments.getAll.invalidate();
        }
    });

    const commentsData = filter === "pending" ? pendingQuery.data : allQuery.data;
    const isLoading = filter === "pending" ? pendingQuery.isLoading : allQuery.isLoading;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="font-headline text-xl md:text-2xl text-[#F2F0EB] mb-1 md:mb-2">Community Hub</h2>
                    <p className="font-ui text-xs text-[#8A8880]">Global moderation and community management</p>
                </div>

                <div className="flex bg-[#1C1C1A] border border-[#2A2A28] rounded-sm p-1 w-full lg:w-auto">
                    <button
                        onClick={() => setFilter("pending")}
                        className={`flex-1 lg:flex-none px-4 py-2.5 text-[10px] md:text-xs font-ui font-600 uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2 ${filter === "pending" ? "bg-[#E8A020] text-[#0F0F0E]" : "text-[#8A8880] hover:text-[#F2F0EB]"
                            }`}
                    >
                        <Clock size={14} />
                        Pending
                        {(pendingQuery.data?.length || 0) > 0 && (
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] ml-1">
                                {pendingQuery.data?.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 lg:flex-none px-4 py-2.5 text-[10px] md:text-xs font-ui font-600 uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2 ${filter === "all" ? "bg-[#333330] text-[#E8A020]" : "text-[#8A8880] hover:text-[#F2F0EB]"
                            }`}
                    >
                        All Comments
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#E8A020]" size={32} /></div>
            ) : !commentsData || commentsData.length === 0 ? (
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-12 text-center text-[#8A8880] font-ui flex flex-col items-center">
                    <CheckCircle2 size={48} className="text-[#2A2A28] mb-4" />
                    <p>No comments found in this section.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {commentsData.map((comment: any) => {
                        const displayName = comment.userUsername ? `@${comment.userUsername}` : comment.userName || "Anonymous";
                        const isPending = comment.approved === 0;
                        const isApproved = comment.approved === 1;
                        const isRejected = comment.approved === -1;

                        return (
                            <Card key={comment.id} className="bg-[#1C1C1A] border-[#2A2A28] p-5 hover:border-[#333330] transition-colors relative">
                                {/* Status Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-sm ${isPending ? "bg-yellow-500" : isApproved ? "bg-green-500" : "bg-red-500"
                                    }`} />

                                <div className="flex flex-col md:flex-row items-start justify-between gap-4 pl-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Meta */}
                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-3">
                                            <span className={`flex items-center gap-1 font-ui text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm ${isPending ? "bg-yellow-900/40 text-yellow-500 border border-yellow-500/20" :
                                                isApproved ? "bg-green-900/40 text-green-500 border border-green-500/20" :
                                                    "bg-red-900/40 text-red-500 border border-red-500/20"
                                                }`}>
                                                {isPending ? "Needs Moderation" : isApproved ? "Published" : "Rejected"}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {comment.userAvatarUrl ? (
                                                    <img src={comment.userAvatarUrl} className="w-5 h-5 rounded-full object-cover border border-[#2A2A28]" alt={displayName} />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-[#2A2A28] flex items-center justify-center font-ui text-[8px] text-[#A3A095]">
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-ui text-xs text-[#E8A020] font-medium">{displayName}</span>
                                            </div>

                                            <span className="font-ui text-xs text-[#555550] flex items-center gap-1">
                                                on Article <ArrowRight size={10} className="inline" /> #{comment.articleId}
                                            </span>

                                            <span className="font-ui text-[10px] text-[#555550]">
                                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <p className="text-[#D4D0C8] leading-relaxed text-sm break-words">{comment.content}</p>
                                            {comment.isEdited === 1 && comment.originalContent && (
                                                <div className="mt-3 p-3 bg-[#0F0F0E] rounded-sm border border-[#222220] flex flex-col gap-1">
                                                    <p className="font-ui text-[10px] text-[#555550] uppercase tracking-widest flex items-center gap-1">
                                                        <Clock size={10} /> Original text before editing:
                                                    </p>
                                                    <p className="text-[#8A8880] text-xs italic line-through opacity-70">{comment.originalContent}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 flex-shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#2A2A28] w-full md:w-auto">
                                        {!isApproved && (
                                            <button
                                                onClick={() => approveMutation.mutate({ id: comment.id })}
                                                disabled={approveMutation.isPending}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-900/30 hover:bg-green-900/60 text-green-400 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50 border border-green-500/20"
                                                title="Approve and publish"
                                            >
                                                <Check size={16} /> <span className="md:hidden">Approve</span>
                                            </button>
                                        )}

                                        {!isRejected && (
                                            <button
                                                onClick={() => rejectMutation.mutate({ id: comment.id })}
                                                disabled={rejectMutation.isPending}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-900/30 hover:bg-yellow-900/60 text-yellow-400 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50 border border-yellow-500/20"
                                                title="Hide (Reject)"
                                            >
                                                <X size={16} /> <span className="md:hidden">Reject</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to PERMANENTLY delete this comment? This action cannot be undone.")) {
                                                    deleteMutation.mutate({ id: comment.id });
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="p-2.5 bg-[#2A2A28] hover:bg-red-900/30 text-red-500 rounded-sm transition-colors disabled:opacity-50 border border-[#333330] hover:border-red-500/30"
                                            title="Delete from Database"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
