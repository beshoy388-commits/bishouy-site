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
            <main className="flex-1 container pt-44 lg:pt-52 pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Editorial Collective</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Guided by integrity, driven by depth</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {team.map(member => (
                            <div key={member.name} className="flex gap-6 items-start bg-[#161614] p-8 rounded-sm border border-[#222220]">
                                <img src={member.image} alt={member.name} className="w-20 h-20 rounded-sm object-cover grayscale border-b-2 border-[#E8A020]" />
                                <div>
                                    <h3 className="font-display text-2xl text-[#F2F0EB]">{member.name}</h3>
                                    <p className="font-ui text-[10px] text-[#E8A020] tracking-widest uppercase mt-2 mb-4">{member.role}</p>
                                    <p className="text-[#8A8880] text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 border-t border-[#1C1C1A] pt-12 text-center text-[#555550]">
                        <p className="text-[10px] font-ui uppercase tracking-[0.3em]">Bishouy.com operates as a collaborative platform for analytical journalism.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
