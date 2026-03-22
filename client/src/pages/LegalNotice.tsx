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
          <section>
            <h2 className="text-[#F2F0EB] text-xl font-headline mb-4 uppercase tracking-widest">Ownership</h2>
            <p>BISHOUY.COM is an independent digital publication dedicated to global news and strategic analysis.</p>
          </section>
          
          <section>
            <h2 className="text-[#F2F0EB] text-xl font-headline mb-4 uppercase tracking-widest">Contact Information</h2>
            <p>For official inquiries, please contact our legal department at legal@bishouy.com.</p>
          </section>
          
          <section>
            <h2 className="text-[#F2F0EB] text-xl font-headline mb-4 uppercase tracking-widest">Intellectual Property</h2>
            <p>All content, including AI-assisted analytical reports and multimedia assets, remains the property of BISHOUY unless otherwise stated.</p>
          </section>
          
          <div className="pt-12 border-t border-[#1C1C1A] text-[10px] uppercase tracking-widest">
            Last Updated: March 2026
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
