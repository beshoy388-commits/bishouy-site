import { trpc } from "@/lib/trpc";
import { X, Bell, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
    const notificationsQuery = trpc.notifications.getLatest.useQuery(undefined, {
        enabled: isOpen,
        refetchInterval: 30000, // Every 30 seconds
    });

    const [lastRead, setLastRead] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            setLastRead(Date.now());
            localStorage.setItem("notifications_last_read", Date.now().toString());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const notifications = notificationsQuery.data || [];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0F0F0E] border-l border-[#222220] shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-[#222220] flex items-center justify-between bg-[#111110]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8A020]/10 rounded-full">
                            <Bell size={20} className="text-[#E8A020]" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl text-[#F2F0EB]">News Alerts</h2>
                            <p className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest">Global Breaking Updates</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#8A8880] hover:text-[#F2F0EB] transition-colors rounded-full hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {notificationsQuery.isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8A8880]">
                            <div className="w-8 h-8 border-2 border-[#E8A020] border-t-transparent rounded-full animate-spin" />
                            <p className="font-ui text-xs uppercase tracking-widest">Searching for updates...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                            <div className="p-4 bg-[#1C1C1A] rounded-full">
                                <Bell size={32} className="text-[#2A2A28]" />
                            </div>
                            <div>
                                <p className="text-[#F2F0EB] font-headline mb-1">No Alerts Right Now</p>
                                <p className="text-[#8A8880] text-xs">Stay tuned. We'll notify you when breaking news happens.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {notifications.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/articolo/${article.slug}`}
                                    onClick={onClose}
                                    className="block group"
                                >
                                    <div className="flex flex-col gap-2 p-4 rounded-sm bg-[#1C1C1A]/50 border border-transparent hover:border-[#E8A020]/20 hover:bg-[#1C1C1A] transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-ui text-[9px] font-600 text-[#E8A020] uppercase tracking-widest px-2 py-0.5 bg-[#E8A020]/10 rounded-full flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-[#E8A020] animate-pulse" />
                                                Breaking News
                                            </span>
                                            <span className="font-ui text-[9px] text-[#555550]">
                                                {new Date(article.publishedAt || article.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="font-headline text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 leading-tight text-base">
                                            {article.title}
                                        </h3>
                                        <p className="text-[#8A8880] text-[11px] line-clamp-2 font-ui leading-relaxed">
                                            {article.excerpt}
                                        </p>
                                        <div className="mt-2 text-[#E8A020] font-ui text-[9px] font-600 uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Read Full Story <ExternalLink size={10} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#222220] bg-[#111110]">
                    <div className="p-4 rounded-sm border border-dashed border-[#2A2A28] bg-transparent flex items-center gap-4 group">
                        <div className="p-2.5 bg-white/5 rounded-full text-[#E8A020]">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <p className="text-[#F2F0EB] text-xs font-headline mb-0.5">Custom Alerts Coming Soon</p>
                            <p className="text-[#8A8880] text-[10px]">Soon you'll be able to follow specific categories and get notified.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
