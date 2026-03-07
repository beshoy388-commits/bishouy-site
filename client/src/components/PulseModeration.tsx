import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, X, AlertCircle, Bot, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-headline text-[#F2F0EB]">AI <span className="text-[#E8A020]">QUARANTINE</span></h2>
                    <p className="text-[#8A8880] text-xs font-ui uppercase tracking-widest mt-1">Social posts flagged for human review</p>
                </div>
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase tracking-widest font-bold">
                    Pending Review: {adminListQuery.data?.length || 0}
                </Badge>
            </div>

            <div className="grid gap-4">
                {adminListQuery.isLoading ? (
                    <p className="text-center py-20 text-[#8A8880]">Syncing AI reports...</p>
                ) : adminListQuery.data?.length === 0 ? (
                    <Card className="bg-[#11110F] border-[#1C1C1A] border-dashed p-20 text-center">
                        <Bot size={40} className="mx-auto mb-4 text-[#333330]" />
                        <p className="text-[#555550] uppercase text-xs font-bold tracking-widest">Community is clean. No flagged posts.</p>
                    </Card>
                ) : (
                    adminListQuery.data?.map((post) => (
                        <Card key={post.id} className="bg-[#1C1C1A] border-[#2A2A28] overflow-hidden">
                            <div className="p-5 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-bold text-[#F2F0EB]">{post.authorName}</span>
                                        <span className="text-[10px] uppercase font-bold text-[#555550]">
                                            {formatDistanceToNow(new Date(post.createdAt))} ago
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#D4D0C8] bg-[#0A0A09] p-4 rounded-sm border border-[#1C1C1A] mb-4">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertCircle size={12} />
                                            Toxicity: {post.aiScore}%
                                        </div>
                                        <div className="text-[#555550]">
                                            Reason: {post.aiReason || 'AI Analysis pending'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 justify-end lg:w-48">
                                    <button
                                        onClick={() => handleDecision(post.id, 'approved')}
                                        disabled={updateStatusMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-black font-bold uppercase text-[10px] rounded-sm hover:bg-green-400 transition-all"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleDecision(post.id, 'rejected')}
                                        disabled={updateStatusMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-black font-bold uppercase text-[10px] rounded-sm hover:bg-red-400 transition-all"
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate({ id: post.id })}
                                        disabled={deleteMutation.isPending}
                                        className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-sm transition-all"
                                        title="Delete permanently"
                                    >
                                        <Trash2 size={14} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
