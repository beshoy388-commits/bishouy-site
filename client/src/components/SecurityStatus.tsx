import { Shield, CheckCircle, AlertTriangle, Terminal, Lock, Globe, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecurityStatus() {
    const logs = [
        { id: 1, type: "auth", status: "success", msg: "Admin session authenticated", time: "2 mins ago" },
        { id: 2, type: "network", status: "blocked", msg: "DDoS attempt mitigated from 192.168.1.1", time: "15 mins ago" },
        { id: 3, type: "system", status: "warning", msg: "Database replication lag: 120ms", time: "45 mins ago" },
        { id: 4, type: "ssl", status: "success", msg: "SSL Certificate renewed successfully", time: "2 hours ago" },
        { id: 5, type: "api", status: "info", msg: "OpenRouter API limits refreshed", time: "5 hours ago" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-headline text-[#F2F0EB]">SECURITY <span className="text-[#E8A020]">PROTOCOLS</span></h2>
                    <p className="text-[#8A8880] text-sm font-ui uppercase tracking-widest mt-1">Real-time threat mitigation & system logs</p>
                </div>
                <div className="flex gap-4">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">ENCRYPTION ACTIVE</Badge>
                    <Badge className="bg-[#E8A020]/10 text-[#E8A020] border-[#E8A020]/20 px-3 py-1">V3.4.0 CORE</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">Access Control</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">0</span>
                        <span className="text-[10px] text-green-500 font-bold uppercase">Failures (24h)</span>
                    </div>
                </Card>
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">Network Shield</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">Active</span>
                        <span className="text-[10px] text-[#E8A020] font-bold uppercase tracking-widest">WAF Mitigation</span>
                    </div>
                </Card>
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="text-[#E8A020]" size={20} />
                        <h4 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-tight">System Impulse</h4>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-headline text-[#F2F0EB]">99.9%</span>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Efficiency Rate</span>
                    </div>
                </Card>
            </div>

            <Card className="bg-[#1C1C1A] border-[#2A2A28] overflow-hidden">
                <div className="p-6 border-b border-[#2A2A28] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#F2F0EB]">
                        <Terminal size={18} className="text-[#E8A020]" />
                        <span className="font-headline text-sm uppercase tracking-widest">Security Event Log</span>
                    </div>
                </div>
                <div className="divide-y divide-[#2A2A28]/50">
                    {logs.map(log => (
                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#F2F0EB]/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                                {log.status === 'success' && <CheckCircle size={16} className="text-green-500" />}
                                {log.status === 'blocked' && <Shield size={16} className="text-red-500" />}
                                {log.status === 'warning' && <AlertTriangle size={16} className="text-yellow-500" />}
                                {log.status === 'info' && <Terminal size={16} className="text-[#E8A020]" />}

                                <div>
                                    <p className="text-sm font-ui text-[#F2F0EB]">{log.msg}</p>
                                    <p className="text-[10px] font-ui text-[#555550] uppercase tracking-widest mt-0.5">{log.type} // node_04</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#555550] uppercase group-hover:text-[#E8A020] transition-colors">{log.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
