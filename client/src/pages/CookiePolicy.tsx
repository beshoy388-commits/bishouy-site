import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-[#0F0F0E]">
      <SEO title="Cookie Policy" />
      <Navbar />
      <div className="container py-20 max-w-4xl">
        <h1 className="font-display text-4xl text-[#F2F0EB] mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none font-ui text-[#8A8880] leading-relaxed space-y-6">
          <p>Last updated: March 20, 2026</p>
          <p>
            This Cookie Policy explains how BISHOUY ("we", "us", or "our") uses cookies and similar technologies when you visit our website at bishouy.com.
          </p>
          <h2 className="text-2xl text-[#F2F0EB] mt-10">Classification of Technologies</h2>
          <div className="space-y-4">
            <div className="bg-[#1C1C1A] p-6 rounded-sm border border-[#2A2A28]">
              <h3 className="text-[#E8A020] font-bold uppercase tracking-widest text-xs mb-2">Essential Protocols</h3>
              <p className="text-sm">These are strictly necessary for the operation of the Neural Nexus. They manage your secure session tokens (JWT) and CSRF protection. Disabling these will result in immediate loss of platform functionality.</p>
            </div>
            
            <div className="bg-[#1C1C1A] p-6 rounded-sm border border-[#2A2A28]">
              <h3 className="text-[#8A8880] font-bold uppercase tracking-widest text-xs mb-2">Analytical Intelligence</h3>
              <p className="text-sm mb-4">We utilize <strong>Umami Analytics</strong> for privacy-first telemetry. These "cookies" (often cookieless in our implementation) help us understand global reading patterns without identifying you personally.</p>
              <p className="text-sm">We also utilize <strong>Google Analytics (GA4)</strong> to gather more detailed behavioral data to optimize our content strategy. This service sets cookies to track unique visitors and session behavior.</p>
            </div>

            <div className="bg-[#1C1C1A] p-6 rounded-sm border border-[#2A2A28]">
              <h3 className="text-[#8A8880] font-bold uppercase tracking-widest text-xs mb-2">Commerce & Advertising</h3>
              <p className="text-sm mb-4"><strong>Stripe</strong> utilizes advanced fraud-prevention technologies that may store local identifiers to ensure secure transaction processing and prevent unauthorized access to financial data.</p>
              <p className="text-sm"><strong>Google AdSense</strong> is used to display non-personalized or personalized advertisements. These cookies help us track ad performance and prevent fraud.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
