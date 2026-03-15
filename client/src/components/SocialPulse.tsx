import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
    Send,
    Heart,
    MessageSquare,
    Trash2,
    User,
    Zap,
    Loader2,
    Clock,
    ShieldCheck
} from "lucide-react";
import { formatRelativeTime } from "@/lib/time-utils";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export default function SocialPulse() {
    const { user, isAuthenticated } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = trpc.useUtils();

    // Query posts
    const { data: posts, isLoading } = trpc.social.list.useQuery({ limit: 10 }, {
        refetchInterval: 30000, // Balanced for performance
    });

    // Create post mutation
    const createMutation = trpc.social.create.useMutation({
        onSuccess: (data) => {
            setContent("");
            toast.success(data.message);
            utils.social.list.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => setIsSubmitting(false)
    });

    // Like mutation
    const likeMutation = trpc.social.toggleLike.useMutation({
        onSuccess: () => {
            utils.social.list.invalidate();
        }
    });

    // Delete mutation
    const deleteMutation = trpc.social.delete.useMutation({
        onSuccess: () => {
            toast.success("Pulse removed.");
            utils.social.list.invalidate();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        createMutation.mutate({ content });
    };

    return (
        <Card className="bg-[#11110F] border-[#1C1C1A] overflow-hidden flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#1C1C1A] flex items-center justify-between bg-[#0A0A09]">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Zap size={16} className="text-[#E8A020]" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <h3 className="font-ui text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.2em]">
                        BISHOUY <span className="text-[#E8A020]">PULSE</span>
                    </h3>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] font-bold uppercase py-0 px-2 tracking-tighter">
                    LIVE Community
                </Badge>
            </div>

            {/* Input Area */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="p-4 border-b border-[#1C1C1A] bg-[#11110F]">
                    <div className="relative group">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening? (AI Moderated)"
                            className="w-full bg-[#0A0A09] border border-[#2A2A28] rounded-lg p-3 text-xs text-[#D4D0C8] placeholder-[#555550] focus:outline-none focus:border-[#E8A020]/50 transition-all resize-none h-20 group-hover:border-[#2A2A28]"
                            maxLength={500}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#333330] font-mono">
                                {content.length}/500
                            </span>
                            <button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="p-2 bg-[#E8A020] text-[#0F0F0E] rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 opacity-40">
                        <ShieldCheck size={10} className="text-[#E8A020]" />
                        <span className="text-[8px] font-bold text-[#8A8880] uppercase tracking-widest">Protected by AI Sentinel v3</span>
                    </div>
                </form>
            ) : (
                <div className="p-6 border-b border-[#1C1C1A] text-center bg-[#11110F]/80 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#E8A020]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.2em] mb-2 relative z-10">Sync with the Pulse</p>
                    <p className="text-[9px] text-[#8A8880] mb-4 max-w-[200px] mx-auto leading-relaxed relative z-10">Authentication required for real-time node interaction and data broadcast.</p>
                    <Link href="/login" className="inline-block bg-[#E8A020] text-[#0F0F0E] text-[9px] font-900 uppercase tracking-widest px-6 py-2 rounded-sm hover:scale-105 active:scale-95 transition-all relative z-10">
                        Join Community
                    </Link>
                </div>
            )}

            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide divide-y divide-[#1C1C1A]">
                {isLoading ? (
                    <div className="p-10 flex flex-col items-center gap-4 text-[#8A8880]">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Syncing Nodes...</span>
                    </div>
                ) : posts?.length === 0 ? (
                    <div className="p-10 text-center opacity-30">
                        <Zap size={24} className="mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Pulse sequence empty</p>
                    </div>
                ) : (
                    posts?.map((post) => (
                        <div key={post.id} className="p-4 hover:bg-[#1C1C1A]/30 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C1C1A] to-[#0A0A09] border border-[#2A2A28] flex items-center justify-center flex-shrink-0">
                                    {post.authorAvatar ? (
                                        <img src={post.authorAvatar} alt="" className="w-full h-full rounded-full" loading="lazy" />
                                    ) : (
                                        <User size={14} className="text-[#555550]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-[#F2F0EB]">{post.authorName}</span>
                                            {post.authorRole === 'admin' && (
                                                <Badge variant="outline" className="h-4 border-[#E8A020]/30 text-[#E8A020] text-[8px] font-900 px-1.5 uppercase tracking-tighter shadow-[0_0_10px_rgba(232,160,32,0.1)]">ROOT</Badge>
                                            )}
                                            {post.authorId && post.authorId < 100 && (
                                                <Badge variant="outline" className="h-4 border-[#8A8880]/30 text-[#8A8880] text-[7px] font-800 px-1.5 uppercase tracking-tighter opacity-70">Founding</Badge>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold text-[#333330] flex items-center gap-1">
                                            <Clock size={8} />
                                            {formatRelativeTime(post.createdAt)} ago
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#D4D0C8] leading-relaxed mb-3 whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => likeMutation.mutate({ postId: post.id })}
                                            className="flex items-center gap-1.5 text-[#555550] hover:text-[#E8A020] transition-colors"
                                        >
                                            <Heart size={12} className={post.liked ? "fill-[#E8A020] text-[#E8A020]" : ""} />
                                            <span className="text-[10px] font-bold tabular-nums">{post.likeCount || 0}</span>
                                        </button>
                                        {(user?.id === post.authorId || user?.role === 'admin') && (
                                            <button
                                                onClick={() => deleteMutation.mutate({ id: post.id })}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-[#555550] hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
