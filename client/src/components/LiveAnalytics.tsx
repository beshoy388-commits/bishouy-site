import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
    Users,
    MapPin,
    Monitor,
    Activity,
    User,
    ExternalLink,
    Shield,
    Zap,
    Globe,
    Loader2,
    ChevronRight,
    Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export default function LiveAnalytics() {
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const { data: visitors, isLoading, refetch } = trpc.analytics.getLiveVisitors.useQuery(undefined, {
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const registeredCount = visitors?.filter((v: any) => v.userId).length || 0;
    const guestCount = (visitors?.length || 0) - registeredCount;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 flex items-center justify-between">
                    <div>
                        <p className="font-ui text-[10px] font-bold text-[#8A8880] uppercase tracking-widest mb-1">Active Nodes</p>
                        <h3 className="font-headline text-3xl text-[#F2F0EB]">{visitors?.length || 0}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#E8A020]/10 flex items-center justify-center text-[#E8A020]">
                        <Activity size={24} className="animate-pulse" />
                    </div>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 flex items-center justify-between">
                    <div>
                        <p className="font-ui text-[10px] font-bold text-[#8A8880] uppercase tracking-widest mb-1">Registered Users</p>
                        <h3 className="font-headline text-3xl text-green-500">{registeredCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <Shield size={24} />
                    </div>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 flex items-center justify-between">
                    <div>
                        <p className="font-ui text-[10px] font-bold text-[#8A8880] uppercase tracking-widest mb-1">Anonymous Tokens</p>
                        <h3 className="font-headline text-3xl text-[#8A8880]">{guestCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#8A8880]/10 flex items-center justify-center text-[#8A8880]">
                        <User size={24} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visitors List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-ui text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap size={14} className="text-[#E8A020]" />
                            Real-Time Access Log
                        </h3>
                        <Badge variant="outline" className="text-[9px] border-[#2A2A28] text-[#555550]">
                            Updating Live
                        </Badge>
                    </div>

                    <Card className="bg-[#11110F] border-[#1C1C1A] overflow-hidden">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
                                <p className="font-ui text-[10px] text-[#555550] uppercase tracking-widest">Scanning Network...</p>
                            </div>
                        ) : visitors?.length === 0 ? (
                            <div className="py-20 text-center text-[#555550]">
                                <Globe size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-ui text-[10px] uppercase tracking-widest">No active nodes detected</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#1C1C1A]">
                                {visitors?.map((visitor: any) => (
                                    <div
                                        key={visitor.sessionId}
                                        className={`p-4 flex items-center justify-between hover:bg-[#1C1C1A]/50 transition-all cursor-pointer group ${selectedVisitor?.sessionId === visitor.sessionId ? 'bg-[#1C1C1A]' : ''}`}
                                        onClick={() => setSelectedVisitor(visitor)}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${visitor.userId ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#1C1C1A] text-[#555550] border border-[#222220]'}`}>
                                                {visitor.userId ? <Shield size={18} /> : <User size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-ui text-xs font-bold text-[#F2F0EB] truncate">
                                                        {visitor.userName || visitor.ipAddress || 'Anonymous Node'}
                                                    </span>
                                                    {visitor.userRole === 'admin' && (
                                                        <Badge className="bg-[#E8A020] text-[#0F0F0E] text-[8px] h-4">ROOT</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-[#555550] uppercase tracking-widest font-bold">
                                                    <span className="truncate">{visitor.currentPath}</span>
                                                    <span className="w-1 h-1 rounded-full bg-[#1C1C1A]" />
                                                    <span>{formatDistanceToNow(new Date(visitor.lastActiveAt))} ago</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className={`text-[#333330] group-hover:text-[#E8A020] transition-all transform ${selectedVisitor?.sessionId === visitor.sessionId ? 'translate-x-1' : ''}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Visitor Details Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        {selectedVisitor ? (
                            <Card className="bg-[#1C1C1A] border-[#2A2A28] overflow-hidden animate-fade-in shadow-2xl">
                                <div className="p-6 border-b border-[#2A2A28] bg-gradient-to-br from-[#1C1C1A] to-[#11110F]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-ui text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.2em]">Node Investigation</h3>
                                        <button
                                            onClick={() => setSelectedVisitor(null)}
                                            className="p-1 text-[#555550] hover:text-[#F2F0EB]"
                                        >
                                            <Zap size={14} className="rotate-45" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border transition-all ${selectedVisitor.userId ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-[#11110F] border-[#2A2A28] text-[#E8A020]'}`}>
                                            {selectedVisitor.userId ? <Shield size={32} /> : <Zap size={32} />}
                                        </div>
                                        <h4 className="font-headline text-xl text-[#F2F0EB] mb-1">{selectedVisitor.userName || 'Guest Visitor'}</h4>
                                        <p className="font-ui text-[10px] font-bold text-[#E8A020] uppercase tracking-widest mb-4">
                                            {selectedVisitor.userId ? 'Authenticated Member' : 'Anonymous Observer'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <MapPin size={16} className="text-[#8A8880] mt-1" />
                                            <div>
                                                <p className="text-[10px] font-ui font-900 text-[#333330] uppercase tracking-widest mb-1">IP ADDRESS & ORIGIN</p>
                                                <p className="text-xs text-[#F2F0EB] font-bold">{selectedVisitor.ipAddress}</p>
                                                <p className="text-[10px] text-[#555550] font-bold uppercase mt-1">Location: {selectedVisitor.location || 'Detecting...'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <Monitor size={16} className="text-[#8A8880] mt-1" />
                                            <div>
                                                <p className="text-[10px] font-ui font-900 text-[#333330] uppercase tracking-widest mb-1">SYSTEM CONFIGURATION</p>
                                                <p className="text-[10px] text-[#D4D0C8] font-bold leading-relaxed">{selectedVisitor.userAgent}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <Activity size={16} className="text-[#8A8880] mt-1" />
                                            <div>
                                                <p className="text-[10px] font-ui font-900 text-[#333330] uppercase tracking-widest mb-1">CURRENT TRAJECTORY</p>
                                                <a
                                                    href={selectedVisitor.currentPath}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-[#E8A020] hover:underline flex items-center gap-1.5 font-bold"
                                                >
                                                    {selectedVisitor.currentPath}
                                                    <ExternalLink size={10} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[#2A2A28]">
                                        <p className="text-[9px] text-[#333330] font-ui uppercase font-900 tracking-[0.2em] mb-4">Activity Timeline</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-[#8A8880] uppercase">Connected: {new Date(selectedVisitor.lastActiveAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="bg-[#1C1C1A]/50 border-[#2A2A28] border-dashed p-10 text-center">
                                <Info size={32} className="mx-auto mb-4 text-[#2A2A28]" />
                                <p className="font-ui text-[10px] text-[#555550] font-bold uppercase tracking-widest leading-relaxed">
                                    Select a visitor from the live feed to analyze their node profile and network signature.
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
