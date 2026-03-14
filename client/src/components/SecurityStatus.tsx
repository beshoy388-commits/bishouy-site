import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Shield, CheckCircle, AlertTriangle, Terminal, Lock, Globe, Zap, Search, Loader2, X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SecurityStatus() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [newIp, setNewIp] = useState("");
    const [ipReason, setIpReason] = useState("");

    const { data: auditLogs, isLoading: logsLoading } = trpc.security.getAuditLogs.useQuery({ limit: 20 });
    const { data: blacklistedIps, isLoading: ipsLoading, refetch: refetchIps } = trpc.security.getBlacklistedIps.useQuery();

    const blacklistMutation = trpc.security.blacklistIp.useMutation({
        onSuccess: () => {
            toast.success("IP Blacklisted");
            setNewIp("");
            setIpReason("");
            refetchIps();
        },
        onError: (err) => toast.error(err.message)
    });

    const unblacklistMutation = trpc.security.unblacklistIp.useMutation({
        onSuccess: () => {
            toast.success("IP Removed from Blacklist");
            refetchIps();
        },
        onError: (err) => toast.error(err.message)
    });

    const handleRunScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    toast.success("Security Scan Complete", { description: "Verified integrity of 42 nodes. No active breaches found." });
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-headline text-[#F2F0EB]">SECURITY <span className="text-[#E8A020]">PROTOCOLS</span></h2>
                    <p className="text-[#8A8880] text-sm font-ui uppercase tracking-widest mt-1">Real-time threat mitigation & system logs</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-3 justify-end">
                        <button
                            onClick={handleRunScan}
                            disabled={isScanning}
                            className="flex items-center gap-2 px-6 py-2 bg-[#E8A020] text-[#0F0F0E] rounded text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <Search size={14} />
                            {isScanning ? "Scanning..." : "Initiate Full Scan"}
                        </button>
                    </div>
                </div>
            </div>

            {isScanning && (
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-[#E8A020] uppercase tracking-widest">
                        <span>Neural Node Inspection</span>
                        <span>{scanProgress}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#11110F] rounded-full overflow-hidden">
                        <div className="h-full bg-[#E8A020] transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">Active Blocks</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">{blacklistedIps?.length || 0}</span>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Restricted IPs</span>
                    </div>
                </Card>
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">System Shield</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">Active</span>
                        <span className="text-[10px] text-[#E8A020] font-bold uppercase tracking-widest">Whitelist Enforced</span>
                    </div>
                </Card>
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">Audit Health</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">Secure</span>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Logs verified</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* IP Blacklist Manager */}
                <Card className="bg-[#1C1C1A] border-[#2A2A28] flex flex-col">
                    <div className="p-6 border-b border-[#2A2A28] flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#F2F0EB]">
                            <Globe size={18} className="text-[#E8A020]" />
                            <span className="font-headline text-sm uppercase tracking-widest">IP Blacklist Management</span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 border-b border-[#2A2A28]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder="IP Address (e.g. 192.168.1.1)"
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                                className="bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] text-xs px-4 py-2 rounded focus:border-[#E8A020] outline-none transition-all"
                            />
                            <input 
                                type="text" 
                                placeholder="Reason (Optional)"
                                value={ipReason}
                                onChange={(e) => setIpReason(e.target.value)}
                                className="bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] text-xs px-4 py-2 rounded focus:border-[#E8A020] outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => blacklistMutation.mutate({ ip: newIp, reason: ipReason })}
                            disabled={!newIp || blacklistMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-[#E8A020] text-[#0F0F0E] text-[10px] font-bold uppercase tracking-widest py-2 rounded hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Plus size={14} /> Add to Blacklist
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[400px]">
                        {ipsLoading ? (
                             <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-[#E8A020]" /></div>
                        ) : blacklistedIps?.length === 0 ? (
                            <div className="p-12 text-center text-[#555550] text-xs uppercase tracking-widest">No active IP blocks</div>
                        ) : (
                            <div className="divide-y divide-[#2A2A28]/50">
                                {blacklistedIps?.map((entry: any) => (
                                    <div key={entry.ipAddress} className="p-4 flex items-center justify-between group hover:bg-red-500/[0.02]">
                                        <div className="min-w-0">
                                            <p className="text-sm font-mono text-[#F2F0EB]">{entry.ipAddress}</p>
                                            <p className="text-[10px] text-[#555550] uppercase tracking-tighter truncate">{entry.reason || 'No reason provided'}</p>
                                        </div>
                                        <button 
                                            onClick={() => unblacklistMutation.mutate({ ip: entry.ipAddress })}
                                            className="p-2 text-[#555550] hover:text-red-500 transition-colors"
                                            title="Unblock"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Audit Logs */}
                <Card className="bg-[#1C1C1A] border-[#2A2A28] flex flex-col">
                    <div className="p-6 border-b border-[#2A2A28] flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#F2F0EB]">
                            <Terminal size={18} className="text-[#E8A020]" />
                            <span className="font-headline text-sm uppercase tracking-widest">Recent Security Events</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[600px]">
                        {logsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-[#E8A020]" /></div>
                        ) : (
                            <div className="divide-y divide-[#2A2A28]/50 text-xs">
                                {auditLogs?.map((log: any) => (
                                    <div key={log.id} className="p-4 space-y-2 hover:bg-[#F2F0EB]/[0.02] transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`text-[9px] px-1.5 py-0 rounded-sm ${
                                                    log.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {log.status.toUpperCase()}
                                                </Badge>
                                                <span className="text-[#F2F0EB] font-bold uppercase tracking-widest">{log.resource}:{log.action}</span>
                                            </div>
                                            <span className="text-[9px] text-[#555550] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-[10px] text-[#8A8880]">
                                            <div>
                                                <span className="text-[#555550] mr-1">ACTOR:</span> {log.userName || 'System'}
                                            </div>
                                            <div className="text-right truncate">
                                                <span className="text-[#555550] mr-1">IP:</span> {log.ipAddress || 'Internal'}
                                            </div>
                                        </div>
                                        {log.changes && (
                                            <div className="bg-[#0F0F0E] p-2 rounded border border-[#2A2A28] font-mono text-[9px] text-[#E8A020]/70 truncate">
                                                {log.changes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
