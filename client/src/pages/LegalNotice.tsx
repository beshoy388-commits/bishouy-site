import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <SEO title="Legal Notice" />
      <Navbar />
      <main className="container py-24 max-w-4xl">
        <h1 className="font-display text-4xl text-[#F2F0EB] mb-8 uppercase tracking-tighter">Legal Notice</h1>
        <div className="prose prose-invert max-w-none font-ui text-[#8A8880] space-y-6">
          <section className="bg-[#11110F] p-8 border border-[#1C1C1A] rounded-sm">
            <h2 className="text-[#E8A020] text-sm font-ui mb-4 uppercase tracking-[0.3em] font-900">Nodal Ownership</h2>
            <p className="text-sm leading-relaxed mb-4">BISHOUY ENTERPRISE operates as a decentralized intelligence collective. This digital platform is the primary uplink for our analytical publications and strategic research assets.</p>
            <div className="text-[10px] space-y-1 opacity-70">
              <p>Registered Entity: [INSERT COMPANY NAME / INDIVIDUAL NAME]</p>
              <p>Address: [INSERT PHYSICAL ADDRESS]</p>
              <p>Tax ID / VAT: [INSERT VAT NUMBER]</p>
            </div>
          </section>

          <section className="bg-[#11110F] p-8 border border-[#1C1C1A] rounded-sm">
            <h2 className="text-[#E8A020] text-sm font-ui mb-4 uppercase tracking-[0.3em] font-900">Communication Protocols</h2>
            <p className="text-sm leading-relaxed">Official legal correspondence and regulatory inquiries must be directed to our dedicated compliance desk: <span className="text-[#F2F0EB] font-bold">legal@bishouy.com</span>.</p>
          </section>

          <section className="bg-[#11110F] p-8 border border-[#1C1C1A] rounded-sm">
            <h2 className="text-[#E8A020] text-sm font-ui mb-4 uppercase tracking-[0.3em] font-900">Intellectual Sovereignty</h2>
            <p className="text-sm leading-relaxed">The Neural Nexus, including all AI-synthesized intelligence segments, proprietary datasets, and curated editorial content, is protected under international intellectual property treaties. Unauthorized extraction or duplication will trigger defensive legal protocols.</p>
          </section>

          <div className="pt-12 text-[9px] uppercase tracking-[0.5em] text-[#333330]">
            BISHOUY SYSTEM CORE // LEGAL REVISION: 4.01.2026
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
