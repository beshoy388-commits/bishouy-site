import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Terminal as TerminalIcon, RefreshCw, Clock, Mail, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DebugTerminal() {
    const { data: codes, refetch, isLoading } = trpc.system.getDebugLogs.useQuery(undefined, {
        refetchInterval: 5000 // Auto-refresh every 5s
    });

    return (
        <div className="min-h-screen bg-[#0F0F0E]">
            <Navbar />

            <main className="container pt-32 pb-16">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#E8A020]/10 text-[#E8A020] px-3 py-1 rounded-full text-[10px] font-600 uppercase tracking-widest mb-4">
                            <TerminalIcon size={12} />
                            System Console
                        </div>
                        <h1 className="font-display text-4xl text-[#F2F0EB]">DEBUG CONSOLE</h1>
                        <p className="font-ui text-sm text-[#8A8880]">View real-time verification codes and system events.</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1A] border border-[#2A2A28] text-[#F2F0EB] font-ui text-xs rounded-sm hover:border-[#E8A020] transition-colors"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </header>

                <div className="bg-[#0A0A09] border border-[#222220] rounded-sm overflow-hidden font-mono shadow-2xl">
                    <div className="bg-[#1C1C1A] px-4 py-2 border-b border-[#222220] flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                        </div>
                        <span className="text-[10px] text-[#555550] uppercase tracking-widest ml-4">Verification Logs</span>
                    </div>

                    <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                        {codes && codes.length > 0 ? (
                            codes.map((item: any) => (
                                <div key={item.id} className="group border-l-2 border-[#E8A020] pl-4 py-1 hover:bg-[#1C1C1A]/30 transition-colors">
                                    <div className="flex items-center gap-3 text-[10px] text-[#555550]">
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(item.createdAt).toLocaleTimeString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail size={10} />
                                            {item.email}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3">
                                        <span className="text-[#8A8880] text-sm">Auth code generated:</span>
                                        <span className="text-[#E8A020] text-xl font-800 tracking-widest">{item.code}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-[#555550] text-sm italic">No logs found. Try performing a registration.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 bg-[#1C1C1A]/50 p-4 border border-[#2A2A28]/50 rounded-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#E8A020]/10 rounded-sm">
                            <Shield size={20} className="text-[#E8A020]" />
                        </div>
                        <div>
                            <h4 className="text-[#F2F0EB] text-sm font-600 mb-1">Developer Tip</h4>
                            <p className="text-[#8A8880] text-xs leading-relaxed">
                                This console is only for local testing. In production, these codes are sent exclusively to the user's email.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
