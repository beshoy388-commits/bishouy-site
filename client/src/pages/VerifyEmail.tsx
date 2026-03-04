import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VerifyEmail() {
    const [location, setLocation] = useLocation();
    const [code, setCode] = useState("");

    // Get email from query params
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email") || "";

    useEffect(() => {
        if (!email) {
            setLocation("/login");
        }
    }, [email, setLocation]);

    const verifyMutation = trpc.auth.verifyEmail.useMutation({
        onSuccess: () => {
            toast.success("Email verified!", { description: "Welcome to BISHOUY." });
            window.location.href = "/";
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length === 6) {
            verifyMutation.mutate({ email, code });
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F0E]">
            <Navbar />

            <main className="container pt-32 pb-16 flex items-center justify-center">
                <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8A020]/10 text-[#E8A020] mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="font-display text-3xl text-[#F2F0EB] mb-2">VERIFY EMAIL</h1>
                        <p className="font-ui text-sm text-[#8A8880]">
                            Enter the 6-digit code sent to <span className="text-[#F2F0EB] font-600">{email}</span>.
                        </p>
                        <p className="font-ui text-[10px] text-[#555550] mt-2 italic">(Check your server console if in development)</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block text-center">Verification Code</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-4 text-center text-3xl font-display tracking-[0.5em] text-[#E8A020] focus:outline-none focus:border-[#E8A020] transition-colors"
                                placeholder="000000"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifyMutation.isPending || code.length !== 6}
                            className="w-full bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            {verifyMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            Verify Account
                        </button>
                    </form>

                    <button
                        onClick={() => setLocation("/login")}
                        className="mt-8 w-full text-center font-ui text-xs text-[#555550] hover:text-[#8A8880] transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
