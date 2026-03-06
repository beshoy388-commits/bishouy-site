import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Contact Us | Bishouy.com" description="Get in touch with the Bishouy editorial team." />
            <Navbar />
            <main className="flex-1 container pt-32 pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Contact Us</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Direct lines to our desks</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <p className="text-[#D4D0C8] leading-relaxed mb-8">
                                Whether you have a secure tip, a press inquiry, or feedback regarding our recent publications, our communications team is ready to direct your message to the appropriate department.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4 items-start">
                                    <Mail className="text-[#E8A020] w-6 h-6 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1">Editorial & Tips</h4>
                                        <a href="mailto:editor@bishouy.com" className="text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-sm">editor@bishouy.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <Mail className="text-[#E8A020] w-6 h-6 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1">Press & Partnerships</h4>
                                        <a href="mailto:press@bishouy.com" className="text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-sm">press@bishouy.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start pb-8 border-b border-[#1C1C1A]">
                                    <MapPin className="text-[#E8A020] w-6 h-6 mt-1" />
                                    <div>
                                        <h4 className="font-display text-lg text-[#F2F0EB] mb-1">Headquarters</h4>
                                        <address className="text-[#8A8880] font-ui text-sm not-italic leading-relaxed">
                                            Bishouy Media Group<br />
                                            100 Global Avenue, Suite 400<br />
                                            Geneva, Switzerland 1204
                                        </address>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="bg-[#1C1C1A] p-8 border border-[#2A2A28] rounded-sm flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">Issue / Department</label>
                                <select className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020]">
                                    <option>Editorial Feedback</option>
                                    <option>Secure Tip</option>
                                    <option>Business Inquiry</option>
                                    <option>Technical Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">Email Address</label>
                                <input type="email" placeholder="Optional for secure tips" className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020]" />
                            </div>

                            <div>
                                <label className="block font-ui text-xs font-600 text-[#8A8880] uppercase tracking-widest mb-2">Message</label>
                                <textarea rows={5} placeholder="Your message..." className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] p-3 rounded-sm font-ui text-sm focus:outline-none focus:border-[#E8A020] resize-none"></textarea>
                            </div>

                            <button type="submit" className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-bold uppercase tracking-widest py-4 rounded-sm transition-all focus:outline-none active:scale-95 mt-2">
                                Send Securely
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
