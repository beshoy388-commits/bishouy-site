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
            <main className="flex-1 container pt-32 pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Editorial Team</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">The minds shaping our narrative</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        {team.map(member => (
                            <div key={member.name} className="flex gap-6 items-start">
                                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-sm object-cover grayscale hover:grayscale-0 transition-all duration-500 border-b-2 border-[#E8A020]" />
                                <div>
                                    <h3 className="font-display text-2xl text-[#F2F0EB]">{member.name}</h3>
                                    <p className="font-ui text-xs text-[#E8A020] tracking-widest uppercase mt-2 mb-4">{member.role}</p>
                                    <p className="text-[#D4D0C8] text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 border-t border-[#1C1C1A] pt-12 text-center text-[#8A8880]">
                        <p className="text-sm font-ui uppercase tracking-widest">Coupled with hundreds of independent contributors worldwide.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
