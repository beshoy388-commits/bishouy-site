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
          <h2 className="text-2xl text-[#F2F0EB] mt-10">What are cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
          </p>
          <h2 className="text-2xl text-[#F2F0EB] mt-10">How we use cookies</h2>
          <p>
            We use cookies for several reasons:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential cookies:</strong> Required for the website to function properly.</li>
            <li><strong>Performance cookies:</strong> Help us understand how visitors interact with our site.</li>
            <li><strong>Functional cookies:</strong> Allow the site to remember choices you make (like your language).</li>
            <li><strong>Advertising cookies:</strong> Used to deliver more relevant advertisements to you.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}
