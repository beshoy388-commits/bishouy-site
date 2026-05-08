import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

import { AUTHORS } from "@/lib/authors";

export default function EditorialTeam() {
    const team = Object.values(AUTHORS);

    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Editorial Team | Bishouy.com" description="Meet the people behind the stories." />
            <Navbar />
            <main className="flex-1 container pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6 uppercase tracking-tighter">Editorial Collective</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-[0.4em] uppercase mb-8">Guided by integrity, driven by depth</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {team.map(member => (
                            <div key={member.name} className="flex flex-col sm:flex-row gap-6 items-start bg-[#11110F] p-8 rounded-sm border border-[#1C1C1A] hover:border-[#E8A020]/30 transition-all group">
                                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-sm object-cover grayscale group-hover:grayscale-0 transition-all border border-[#2A2A28]" />
                                <div>
                                    <h3 className="font-display text-2xl text-[#F2F0EB] uppercase tracking-tight">{member.name}</h3>
                                    <p className="font-ui text-[9px] text-[#E8A020] tracking-[0.2em] font-900 uppercase mt-2 mb-4">{member.role}</p>
                                    <p className="text-[#8A8880] text-sm leading-relaxed font-body">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 border-t border-[#1C1C1A] pt-12 text-center">
                        <p className="text-[9px] font-ui text-[#333330] uppercase tracking-[0.5em] mb-4">BISHOUY ENTERPRISE CORE // EDITORIAL PROTOCOL V.4.1</p>
                        <p className="text-[#555550] text-[10px] max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-ui">
                            Our collective operates as a decentralized network of investigative analysts and subject matter experts, committed to the absolute pursuit of signal integrity.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
