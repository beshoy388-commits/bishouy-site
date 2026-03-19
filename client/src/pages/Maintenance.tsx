import { Hammer, Globe, Shield } from "lucide-react";

export default function Maintenance() {
    return (
        <div className="min-h-screen bg-[#0A0A09] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#E8A020]/20 blur-3xl rounded-full" />
                        <div className="relative w-24 h-24 bg-[#11110F] border border-[#1C1C1A] rounded-2xl flex items-center justify-center text-[#E8A020]">
                            <Hammer size={40} className="animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="font-headline text-4xl text-[#F2F0EB] uppercase tracking-tighter">
                        SYSTEM <span className="text-[#E8A020]">MAINTENANCE</span>
                    </h1>
                    <p className="font-ui text-sm text-[#8A8880] leading-relaxed">
                        We are currently upgrading our core architecture to provide a more advanced news ecosystem.
                        The platform will be back online shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-8">
                    <div className="flex items-center gap-4 bg-[#11110F] border border-[#1C1C1A] p-4 rounded-xl">
                        <Globe size={18} className="text-[#E8A020]" />
                        <div className="text-left">
                            <p className="text-[10px] font-ui font-extrabold text-[#8A8880] uppercase tracking-widest">Global Status</p>
                            <p className="text-xs font-ui text-[#F2F0EB]">Restricted Access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#11110F] border border-[#1C1C1A] p-4 rounded-xl">
                        <Shield size={18} className="text-green-500" />
                        <div className="text-left">
                            <p className="text-[10px] font-ui font-extrabold text-[#8A8880] uppercase tracking-widest">Security Layer</p>
                            <p className="text-xs font-ui text-[#F2F0EB]">Active Protocol</p>
                        </div>
                    </div>
                </div>

                <footer className="pt-12">
                    <p className="font-ui text-[9px] text-[#333330] uppercase tracking-[0.4em]">
                        © 2026 BISHOUY ENTERPRISE // CORE OFFLINE
                    </p>
                </footer>
            </div>
        </div>
    );
}
