import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ShieldCheck, Cpu, Eye, Scale } from "lucide-react";

export default function AIEthics() {
    const principles = [
        {
            icon: <Scale className="text-[#E8A020]" />,
            title: "Bias Identification & Mitigation",
            description: "Our neural models are trained to identify partisan language. While we use AI to process raw data, every editorial conclusion is cross-verified against human historical records to prevent algorithmic echo chambers."
        },
        {
            icon: <Eye className="text-[#E8A020]" />,
            title: "Transparent Attribution",
            description: "Whenever a story is augmented by neural pattern recognition, it is clearly tagged with the 'Bishouy Intelligence' node. We believe readers deserve to know which insights are synthesized and which are purely investigative."
        },
        {
            icon: <Cpu className="text-[#E8A020]" />,
            title: "Assisted, Not Replaced",
            description: "AI is our research librarian, not our editor. Our proprietary models are used to find connections across millions of data points, but the final narrative pulse is always dictated by human intuition and ethical standards."
        },
        {
            icon: <ShieldCheck className="text-[#E8A020]" />,
            title: "Data Integrity",
            description: "We do not use 'black-box' generative models for fact-creation. Our AI only summarizes and analyzes verifiable data from our curated network of global sources to ensure zero hallucination."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="AI Ethics & Transparency | Bishouy.com" description="Our commitment to responsible and transparent use of artificial intelligence in journalism." />
            <Navbar />
            <main className="flex-1 container pb-24 pt-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16 border-b border-[#1C1C1A] pb-12">
                        <div className="inline-flex items-center gap-2 bg-[#E8A020]/10 text-[#E8A020] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            Protocol 7.0
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl text-[#E8A020] mb-6">AI Ethics & Neural Transparency</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-[0.2em] uppercase leading-relaxed">Defining the boundaries between algorithmic speed and human integrity.</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-8">
                        <p className="text-xl leading-relaxed text-[#F2F0EB] font-light">
                            At Bishouy.com, we view artificial intelligence as a corrective lens for the chaos of modern information. Our "Neural Journalism" approach allows us to process vast geopolitical events at the speed of the network, but speed must never outpace truth.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                            {principles.map((p, i) => (
                                <div key={i} className="bg-[#161614] border border-[#222220] p-8 rounded-sm hover:border-[#E8A020]/30 transition-all duration-500 group">
                                    <div className="mb-6 transform group-hover:scale-110 transition-transform">{p.icon}</div>
                                    <h3 className="font-display text-xl text-[#F2F0EB] mb-4">{p.title}</h3>
                                    <p className="text-[#8A8880] text-sm leading-relaxed">{p.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 p-8 border-2 border-[#1C1C1A] rounded-sm bg-gradient-to-br from-[#11110F] to-transparent">
                            <h2 className="font-display text-2xl text-[#E8A020] mb-6">The Zero-Hallucination Mandate</h2>
                            <p className="text-[#8A8880] leading-relaxed">
                                Unlike generic conversational bots, the Bishouy Intelligence Node operates within a closed-loop factual environment. Every 'Pulse' and 'Summary' generated is anchored to specific metadata signatures of verifiable sources. If a data point cannot be triangulated across three independent sources, the system is hard-coded to flag it for human review.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
