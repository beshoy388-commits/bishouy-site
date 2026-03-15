import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Briefcase } from "lucide-react";

export default function Careers() {
    const jobs = [
        { title: "Senior Geopolitical Analyst", location: "Global / Remote", type: "Full-Time" },
        { title: "Investigative Data Journalist", location: "Geneva, CH", type: "Full-Time" },
        { title: "AI Integration Engineer", location: "London, UK / Remote", type: "Full-Time" },
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-serif">
            <SEO title="Careers | Bishouy.com" description="Join the newsroom of tomorrow." />
            <Navbar />
            <main className="flex-1 container pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-[#E8A020] mb-6">Careers</h1>
                        <p className="font-ui text-sm text-[#8A8880] tracking-widest uppercase mb-8">Build the future of high-fidelity media</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-[#D4D0C8] space-y-6 mb-16">
                        <p className="text-xl leading-relaxed font-light text-[#F2F0EB]">
                            We are an elite, agile team of reporters, analysts, and technologists. Our culture rewards intellectual rigorousness, relentless curiosity, and engineering excellence.
                        </p>
                        <p className="leading-relaxed text-[#8A8880]">
                            Working here means putting the truth above the narrative. We offer competitive global compensation, comprehensive remote-first infrastructure, and the resources necessary to pursue groundbreaking investigations.
                        </p>
                    </div>

                    <h2 className="font-display text-2xl text-[#F2F0EB] mb-8 border-b border-[#1C1C1A] pb-4">Open Roles</h2>

                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job.title} className="bg-[#1C1C1A] border border-[#2A2A28] p-6 hover:border-[#E8A020] transition-colors duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group">
                                <div>
                                    <h3 className="font-display text-xl text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors mb-2">{job.title}</h3>
                                    <div className="flex gap-4 font-ui text-xs text-[#8A8880] uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.type}</span>
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                <button className="text-[#E8A020] font-ui text-xs font-bold uppercase tracking-widest whitespace-nowrap group-hover:bg-[#E8A020] group-hover:text-[#0F0F0E] px-4 py-2 border border-[#E8A020] rounded-sm transition-all">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-[#8A8880] text-sm italic">Don't see a fit? Send your resume and portfolio to <span className="text-[#E8A020]">careers@bishouy.com</span></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
