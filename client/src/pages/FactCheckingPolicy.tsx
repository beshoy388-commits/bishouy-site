import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function FactCheckingPolicy() {
    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Fact-Checking Policy | Bishouy.com" description="Our rigorous standards for accuracy and verification." />
            <Navbar />
            <main className="flex-1 container pt-32 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Fact-Checking Policy</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Upholding the highest standards of accuracy</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-8">
                        <section>
                            <h2 className="font-display text-2xl text-[#F2F0EB] border-b border-[#2A2A28] pb-2 mb-4">Commitment to Accuracy</h2>
                            <p className="leading-relaxed">
                                At Bishouy.com, accuracy is our foundation. We are committed to verifying all information before publication. Our editorial team utilizes a multi-step verification process to ensure that every claim, quote, and statistic is vetted against primary sources.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl text-[#F2F0EB] border-b border-[#2A2A28] pb-2 mb-4">Primary Sources</h2>
                            <p className="leading-relaxed">
                                We prioritize primary sources—official documents, original interviews, and direct observations. When secondary sources are used, they are clearly identified and cross-referenced with at least two other independent sources.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl text-[#F2F0EB] border-b border-[#2A2A28] pb-2 mb-4">Verification of AI-Assisted Content</h2>
                            <p className="leading-relaxed">
                                While we may use AI for data aggregation and initial drafting (through our "Redazione AI" desk), all such content undergoes rigorous human review. No AI-generated claim is published without being confirmed by a staff editor.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl text-[#F2F0EB] border-b border-[#2A2A28] pb-2 mb-4">The Correction Process</h2>
                            <p className="leading-relaxed">
                                Despite our best efforts, errors can occur. We encourage our readers to report inaccuracies to <a href="mailto:editor@bishouy.com" className="text-[#E8A020] underline">editor@bishouy.com</a>. Once an error is confirmed, we publish a clear correction notice at the top of the article.
                            </p>
                        </section>

                        <div className="mt-16 bg-[#1C1C1A] border-l-4 border-[#E8A020] p-6 text-sm">
                            <p className="font-ui uppercase tracking-widest text-[#8A8880] mb-2 font-bold">Editorial Board</p>
                            <p className="text-[#555550]">This policy is reviewed quarterly to adapt to the evolving landscape of digital information and deep-fake technologies.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
