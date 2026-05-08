import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "wouter";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="About Us | Bishouy.com" description="The definitive intelligence nexus for the global architect class." />
            <Navbar />
            <main className="flex-1 container pb-24 -mt-10 lg:-mt-20">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#E8A020] mb-6 uppercase tracking-tighter">The Mission</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-[0.4em] uppercase mb-8">Uncompromising High-Fidelity Intelligence</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-8">
                        <p className="text-2xl leading-relaxed font-headline text-[#F2F0EB] tracking-tight">
                            BISHOUY is the definitive intelligence nexus for the global architect class. We do not merely report the news; we synthesize the forces that shape civilization.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                            <div className="bg-[#1C1C1A] p-6 border-l-2 border-[#E8A020]">
                                <h4 className="text-[#E8A020] uppercase tracking-[0.2em] text-[10px] font-900 mb-2">Editorial Mandate</h4>
                                <p className="text-sm leading-relaxed">To deliver uncompromised, high-fidelity journalism that pierces through the fog of digital misinformation.</p>
                            </div>
                            <div className="bg-[#1C1C1A] p-6 border-l-2 border-[#E8A020]">
                                <h4 className="text-[#E8A020] uppercase tracking-[0.2em] text-[10px] font-900 mb-2">Neural Nexus</h4>
                                <p className="text-sm leading-relaxed">Leveraging advanced algorithmic intelligence to curate the signal from the noise in real-time.</p>
                            </div>
                        </div>

                        <p className="leading-relaxed">
                            Founded in 2024 as a response to the fragmentation of global discourse, BISHOUY has emerged as the sanctuary for deep-dive analysis. In an era of ephemeral content, we offer permanence. In an era of superficiality, we offer depth.
                        </p>

                        <h2 className="font-display text-3xl text-[#E8A020] mt-16 mb-6 uppercase tracking-tighter">The Vision</h2>
                        <p className="leading-relaxed text-lg">
                            We envision a future where information is not a commodity, but a strategic asset. Our network of elite correspondents and industry veterans operates at the intersection of geopolitics, economy, and the neural frontiers of technology.
                        </p>

                        <div className="bg-[#1C1C1A] border border-[#2A2A28] p-10 my-16 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A020]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#E8A020]/10 transition-all" />
                            <p className="font-display text-2xl text-[#F2F0EB] italic mb-0 relative z-10 leading-tight">
                                "Truth is the only currency that retains value in the age of algorithmic chaos."
                            </p>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <Link href="/contact" className="inline-block bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50 active:scale-95">
                                Contact Us
                            </Link>
                            <Link href="/editorial-team" className="inline-block bg-transparent border border-[#2A2A28] hover:border-[#E8A020] text-[#E8A020] font-ui text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50 active:scale-95">
                                Meet the Team
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
