import { useState } from "react";
import SecurityStatus from "./SecurityStatus";
import SystemConsole from "./SystemConsole";
import { Shield, Terminal as TerminalIcon } from "lucide-react";

export default function SystemTerminal() {
    const [subTab, setSubTab] = useState<"security" | "logs">("security");

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-1 mb-6 bg-[#0F0F0E] p-1 border border-[#1C1C1A] w-fit">
                <button
                    onClick={() => setSubTab("security")}
                    className={`px-6 py-2 transition-all font-ui text-[9px] font-900 uppercase tracking-widest ${subTab === "security" ? "bg-[#E8A020] text-[#0F0F0E]" : "text-[#555550] hover:text-[#8A8880]"}`}
                >
                    <div className="flex items-center gap-2">
                        <Shield size={12} />
                        Security Protocols
                    </div>
                </button>
                <button
                    onClick={() => setSubTab("logs")}
                    className={`px-6 py-2 transition-all font-ui text-[9px] font-900 uppercase tracking-widest ${subTab === "logs" ? "bg-[#E8A020] text-[#0F0F0E]" : "text-[#555550] hover:text-[#8A8880]"}`}
                >
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={12} />
                        Kernel Logs
                    </div>
                </button>
            </div>

            <div className="min-h-[60vh]">
                {subTab === "security" ? <SecurityStatus /> : <SystemConsole />}
            </div>
        </div>
    );
}
