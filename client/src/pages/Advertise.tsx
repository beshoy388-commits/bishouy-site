import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, BarChart3, Users, Globe } from "lucide-react";

export default function Advertise() {
  const stats = [
    { icon: <Users className="text-[#E8A020]" />, label: "Monthly Unique Visitors", value: "2.4M+" },
    { icon: <BarChart3 className="text-[#E8A020]" />, label: "Page Views", value: "8.5M+" },
    { icon: <Globe className="text-[#E8A020]" />, label: "Global Reach", value: "180+ Countries" },
  ];

  return (
    <main className="min-h-screen bg-[#0F0F0E]">
      <SEO title="Advertising & Partnerships" />
      <Navbar />
      <div className="container py-24 max-w-5xl">
        <h1 className="font-display text-5xl md:text-6xl text-[#F2F0EB] mb-6 leading-tight">
          PARTNER WITH THE FUTURE OF <span className="text-[#E8A020]">INTELLIGENCE</span>.
        </h1>
        <p className="font-ui text-xl text-[#8A8880] mb-12 max-w-2xl">
          Connect your brand with a global audience of forward-thinking decision markers, tech innovators, and cultural leaders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#1C1C1A] p-8 border border-[#2A2A28] rounded-sm group hover:border-[#E8A020] transition-all">
              <div className="mb-4 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-3xl font-bold text-[#F2F0EB] mb-1">{stat.value}</div>
              <div className="text-xs text-[#555550] uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#1C1C1A] p-12 border border-[#2A2A28] rounded-sm text-center">
            <h2 className="text-3xl font-display text-[#F2F0EB] mb-4">Request Our Media Kit</h2>
            <p className="text-[#8A8880] mb-10 max-w-lg mx-auto">
              Get detailed demographics, ad formats, and customized partnership opportunities.
            </p>
            <a 
              href="mailto:advertise@bishouy.com" 
              className="inline-flex items-center gap-3 bg-[#E8A020] text-[#0F0F0E] font-bold px-10 py-5 rounded-sm hover:bg-[#D4911C] transition-all"
            >
              <Mail size={18} />
              Contact Our Sales Team
            </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
