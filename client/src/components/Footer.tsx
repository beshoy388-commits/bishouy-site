/*
 * BISHOUY.COM — Footer Component
 * Dark editorial footer with newsletter, categories, social links
 */

import { Link } from "wouter";
import {
  Mail,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Rss,
  Loader2,
} from "lucide-react";
import { CATEGORIES } from "@/lib/articles";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Footer() {
  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscribed!", {
        description: "You'll receive the latest news directly in your inbox.",
      });
      setEmail("");
    },
    onError: (error: any) => {
      toast.error("Subscription failed", { description: error.message });
    },
  });

  const [gdprConsent, setGdprConsent] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprConsent) {
      toast.error("Consent required", { description: "Please accept the privacy terms to subscribe." });
      return;
    }
    if (email) {
      subscribeMutation.mutate({ email });
    }
  };

  return (
    <footer className="bg-[#0A0A09] border-t border-[#1C1C1A] mt-16 selection:bg-[#E8A020]/20 selection:text-[#E8A020]">
      {/* Newsletter banner */}
      <div className="border-b border-[#1C1C1A]">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1">
              <div className="amber-line mb-3" />
              <h2 className="font-display text-2xl text-[#F2F0EB] mb-1">
                STAY INFORMED
              </h2>
              <p className="font-ui text-sm text-[#8A8880]">
                The most important news delivered to your inbox every morning at
                7:00 AM.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <form
                onSubmit={handleNewsletter}
                className="flex gap-2 w-full md:w-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 md:w-64 bg-[#1C1C1A] border border-[#2A2A28] text-[#F2F0EB] placeholder-[#555550] font-ui text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="bg-[#E8A020] hover:bg-[#D4911C] hover:scale-[1.03] hover:shadow-lg hover:shadow-[#E8A020]/20 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-5 py-2.5 rounded-sm transition-all active:scale-95 whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : null}
                  {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="w-3 h-3 accent-[#E8A020]" 
                />
                <span className="text-[10px] text-[#555550] group-hover:text-[#8A8880] transition-colors">
                  I consent to the collection of my data in accordance with the <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="BISHOUY.COM Home">
              <span className="font-display text-3xl text-[#F2F0EB] mb-1 block">
                BISHOUY<span className="text-[#E8A020]">.</span>
              </span>
            </Link>
            <p className="font-ui text-xs text-[#8A8880] mt-3 leading-relaxed">
              Independent, in-depth, and accessible journalism. Since 2024, we
              tell the world's story without filters.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://x.com/bishouy_com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] hover:scale-110 transition-all rounded-sm border border-[#2A2A28]" aria-label="X (Twitter)">
                <Twitter size={14} />
              </a>
              <a href="https://instagram.com/bishouy_com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] hover:scale-110 transition-all rounded-sm border border-[#2A2A28]" aria-label="Instagram">
                <Instagram size={14} />
              </a>
              <a href="https://facebook.com/bishouy_official" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] hover:scale-110 transition-all rounded-sm border border-[#2A2A28]" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="https://youtube.com/@bishouy" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] hover:scale-110 transition-all rounded-sm border border-[#2A2A28]" aria-label="YouTube">
                <Youtube size={14} />
              </a>
              <a href="/api/rss" className="p-2 bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] hover:scale-110 transition-all rounded-sm border border-[#2A2A28]" aria-label="RSS Feed">
                <Rss size={14} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest mb-4">
              Sections
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-ui text-sm text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Our Story", href: "/about" },
                { label: "Editorial Team", href: "/editorial-team" },
                { label: "Contact Us", href: "/contact" },
                { label: "Advertise With Us", href: "/advertise" },
                { label: "Careers", href: "/careers" },
                { label: "Mission & Values", href: "/mission-values" },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest mb-4">
              Legal & Transparency
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Cookie Policy", href: "/cookie-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Legal Notice", href: "/terms-of-service" },
                { label: "Fact-Checking Protocol", href: "/fact-checking" },
                { label: "Code of Ethics", href: "/code-of-ethics" },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1C1C1A]">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-ui text-[11px] text-[#555550]">
              © 2026 Bishouy.com — Built for international clarity & analytical depth.
            </p>
            <div className="flex items-center gap-6">
                <p className="font-ui text-[11px] text-[#555550]">
                  Editor-in-Chief: <span className="text-[#8A8880] font-bold">Beshoy Toubia</span>
                </p>
                <div className="h-3 w-[1px] bg-[#1C1C1A]" />
                <p className="font-ui text-[11px] text-[#555550]">
                  Independence Verified by <span className="text-[#8A8880]">BSY-NEWSBOARD</span>
                </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
