import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, MapPin, Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useState } from "react";

export default function Contact() {
    const [department, setDepartment] = useState("Editorial Feedback");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [feedback, setFeedback] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!message.trim()) {
            setStatus("error");
            setFeedback("Please enter your message before sending.");
            return;
        }

        if (department !== "Secure Tip" && !email.trim()) {
            setStatus("error");
            setFeedback("Email address is required for this inquiry type.");
            return;
        }

        setStatus("submitting");
        
        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus("success");
            setFeedback("Your message has been sent. We'll get back to you soon.");
            setMessage("");
            setEmail("");
        } catch (error) {
            setStatus("error");
            setFeedback("There was an error sending your message. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Contact Us | Bishouy.com" description="Get in touch with the Bishouy editorial team." />
            <Navbar />
            <main className="flex-1 container pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Contact Us</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Direct lines to our desks</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                        <div>
                            <p className="text-[#D4D0C8] leading-relaxed mb-10 text-lg">
                                BISHOUY maintains a high-fidelity communication infrastructure. Direct your inquiry to the appropriate nodal point for prioritized processing.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4 items-start bg-[#11110F] p-6 border border-[#1C1C1A] rounded-sm">
                                    <Mail className="text-[#E8A020] w-5 h-5 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1 uppercase tracking-tighter">Editorial & Intelligence</h4>
                                        <p className="text-[#555550] text-[10px] uppercase tracking-widest mb-2 font-ui">For tips, research, and analysis feedback</p>
                                        <a href="mailto:intel@bishouy.com" className="text-[#E8A020] hover:underline font-ui text-xs">intel@bishouy.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start bg-[#11110F] p-6 border border-[#1C1C1A] rounded-sm">
                                    <Globe className="text-[#E8A020] w-5 h-5 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1 uppercase tracking-tighter">Corporate & Partnerships</h4>
                                        <p className="text-[#555550] text-[10px] uppercase tracking-widest mb-2 font-ui">Advertising, strategic alliances, and media kits</p>
                                        <a href="mailto:enterprise@bishouy.com" className="text-[#E8A020] hover:underline font-ui text-xs">enterprise@bishouy.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start bg-[#11110F] p-6 border border-[#1C1C1A] rounded-sm">
                                    <MapPin className="text-[#E8A020] w-5 h-5 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1 uppercase tracking-tighter">Legal & Data Sovereignty</h4>
                                        <p className="text-[#555550] text-[10px] uppercase tracking-widest mb-2 font-ui">GDPR, Privacy, and Regulatory compliance</p>
                                        <a href="mailto:legal@bishouy.com" className="text-[#E8A020] hover:underline font-ui text-xs">legal@bishouy.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="bg-[#1C1C1A] p-8 border border-[#2A2A28] rounded-sm flex flex-col gap-6" onSubmit={handleSubmit}>
                            {status === "success" && (
                                <div className="bg-[#102010] border border-[#27AE60]/30 p-4 rounded-sm flex items-start gap-3">
                                    <CheckCircle2 className="text-[#27AE60] w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-[#D4F2E1] font-ui text-sm leading-relaxed">{feedback}</p>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="bg-[#201010] border border-[#C0392B]/30 p-4 rounded-sm flex items-start gap-3">
                                    <AlertCircle className="text-[#C0392B] w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-[#F2D4D4] font-ui text-sm leading-relaxed">{feedback}</p>
                                </div>
                            )}

                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">Issue / Department</label>
                                <select 
                                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020]"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option>Editorial Feedback</option>
                                    <option>Secure Tip</option>
                                    <option>Business Inquiry</option>
                                    <option>Technical Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">
                                    Email Address {department === "Secure Tip" ? "(Optional)" : ""}
                                </label>
                                <input 
                                    type="email" 
                                    placeholder={department === "Secure Tip" ? "Optional for secure tips" : "Your email address"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020]" 
                                />
                            </div>

                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">Message</label>
                                <textarea 
                                    rows={5} 
                                    placeholder="Your message..." 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020] resize-none"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === "submitting"}
                                className="bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F0F0E] font-ui text-xs font-bold uppercase tracking-widest py-4 rounded-sm transition-all focus:outline-none active:scale-95 mt-2 flex items-center justify-center gap-2"
                            >
                                {status === "submitting" ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : "Send Securely"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

