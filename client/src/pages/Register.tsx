import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Register() {
    const [, setLocation] = useLocation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: (data) => {
            toast.success("Account created!", { description: data.message });
            setLocation(`/verify?email=${encodeURIComponent(formData.email)}`);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-[#0F0F0E]">
            <Navbar />

            <main className="container pt-32 pb-16 flex items-center justify-center">
                <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl text-[#F2F0EB] mb-2">CREATE ACCOUNT</h1>
                        <p className="font-ui text-sm text-[#8A8880]">Join BISHOUY to participate in the conversation.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]" size={16} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]" size={16} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]" size={16} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                                    placeholder="At least 8 characters"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full bg-[#F2F0EB] hover:bg-[#E8A020] hover:text-[#0F0F0E] disabled:opacity-50 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            {registerMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                            Register
                        </button>
                    </form>

                    <p className="mt-8 text-center font-ui text-xs text-[#555550]">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#E8A020] hover:underline font-600">
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
