import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "wouter";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="About Us | Bishouy.com" description="Learn more about Bishouy.com and our commitment to independent journalism." />
            <Navbar />
            <main className="flex-1 container pt-32 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#E8A020] mb-6">About Us</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Independent, in-depth, and accessible journalism</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-6">
                        <p className="text-xl leading-relaxed font-light text-[#F2F0EB]">
                            Welcome to Bishouy.com, the definitive voice for a new generation of sophisticated readers. We believe that true journalism isn't about simply reporting what happened—it's about investigating why it happened and what it means for your future.
                        </p>
                        <p className="leading-relaxed">
                            Founded in 2024, Bishouy emerged from a collective desire to cut through the noise of modern digital media. In an era dominated by clickbait and superficial scrolling, we have engineered a platform dedicated exclusively to high-fidelity information, critical analysis, and intellectual depth.
                        </p>
                        <h2 className="font-display text-2xl text-[#E8A020] mt-12 mb-4">Our Vision</h2>
                        <p className="leading-relaxed">
                            We envision a world where readers are empowered rather than overwhelmed. Our global network of senior correspondents and industry experts works tirelessly to deliver contextualized, objective storytelling. From geopolitical shifts to the frontiers of technology, culture, and economy, we curate the signal from the noise.
                        </p>
                        <div className="bg-[#1C1C1A] border-l-4 border-[#E8A020] p-6 my-10 relative">
                            <p className="font-display text-xl text-[#F2F0EB] italic mb-0 relative z-10">
                                "To tell the world's story without filters, without fear, and without compromise."
                            </p>
                        </div>
                        <p className="leading-relaxed">
                            Thank you for trusting us with your time. We invite you to explore our sections, engage with our editorial team, and become part of a community that values the truth above all else.
                        </p>

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
