import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function MissionValues() {
    const values = [
        { title: "Objectivity in Nuance", description: "While pure objectivity is an illusion, fairness is a discipline. We present multiple facets of complex issues without drawing prejudiced conclusions for the reader." },
        { title: "Depth over Speed", description: "We refuse to race for the first click. Our priority is delivering the most accurate, well-researched, and historically grounded reporting available." },
        { title: "Intellectual Respect", description: "We assume our readers are intelligent. We do not dumb down global events, nor do we sensationalize headlines for cheap engagement." },
        { title: "Independence", description: "Bishouy.com operates unencumbered by corporate conglomerates or political affiliations. Our allegiance is strictly to truth and our readership." },
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Mission & Values | Bishouy.com" description="The core principles that guide our editorial board." />
            <Navbar />
            <main className="flex-1 container pt-32 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Mission & Values</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Our compass in a chaotic information age</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-6">
                        <p className="text-xl leading-relaxed font-light text-[#F2F0EB]">
                            Our mission is singular: to construct a sanctuary of rigorous journalism amidst the digital noise, equipping decision-makers and global citizens with uncompromising facts.
                        </p>

                        <div className="mt-16 space-y-12">
                            {values.map((v, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 items-start border-l-2 border-[#1C1C1A] hover:border-[#E8A020] pl-6 transition-colors duration-500">
                                    <div className="w-8 h-8 rounded-sm bg-[#E8A020] text-[#0F0F0E] flex items-center justify-center font-ui font-bold flex-shrink-0 mt-1">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-2xl text-[#F2F0EB] mb-3">{v.title}</h3>
                                        <p className="leading-relaxed text-[#8A8880]">{v.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
