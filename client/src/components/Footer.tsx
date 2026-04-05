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

export default function Footer({ hideNewsletter = false }: { hideNewsletter?: boolean }) {
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
  const { data: status } = trpc.system.getStatus.useQuery();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Validation Error", { description: "Please enter your email address" });
      return;
    }

    if (!gdprConsent) {
      toast.error("Consent required", { description: "Please accept the privacy terms to subscribe." });
      return;
    }

    subscribeMutation.mutate({ email });
  };

  const socialLinks = {
    x: status?.socialX || "https://x.com/bishouy_news",
    instagram: status?.socialInstagram || "https://instagram.com/bishouy_com",
    facebook: status?.socialFacebook || "https://facebook.com/bishouy.official",
    youtube: status?.socialYoutube || "https://youtube.com/@bishouytoubia"
  };

  return (
    <footer className="bg-[#0A0A09] mt-16 selection:bg-[#E8A020]/20 selection:text-[#E8A020]">
      {/* Newsletter Section - Modern Glassmorphic Banner */}
      {!hideNewsletter && (
        <div className="container px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#11110F] to-[#0A0A09] border border-[#1C1C1A] p-8 md:p-12 shadow-2xl">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8A020]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A020]/10 border border-[#E8A020]/20 mb-6 mx-auto lg:mx-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                  <span className="text-[9px] font-900 text-[#E8A020] uppercase tracking-[0.2em]">Intel Distribution</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-[#F2F0EB] mb-4 leading-none tracking-tighter">
                  NEVER MISS <br className="hidden md:block"/> A <span className="text-[#E8A020]">CRITICAL</span> UPDATE
                </h2>
                <p className="font-ui text-sm text-[#8A8880] max-w-md mx-auto lg:mx-0 leading-relaxed uppercase tracking-widest">
                  Daily analytical briefings delivered at 07:00 AM UTC.
                </p>
              </div>

              <div className="w-full lg:w-auto lg:min-w-[400px]">
                <form
                  onSubmit={handleNewsletter}
                  className="space-y-4"
                  noValidate
                >
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-[#0F0F0E] border border-[#2A2A28] text-[#F2F0EB] placeholder-[#555550] font-ui text-sm pl-5 pr-32 py-4 rounded-xl focus:outline-none focus:border-[#E8A020] transition-all group-hover:border-[#333330] shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={subscribeMutation.isPending}
                      className="absolute right-2 top-2 bottom-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-900 uppercase tracking-widest px-6 rounded-lg transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                    >
                      {subscribeMutation.isPending ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : "Subscribe"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 px-2">
                    <input 
                      type="checkbox" 
                      id="gdpr-footer"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="w-4 h-4 accent-[#E8A020] rounded border-[#2A2A28] bg-[#0A0A09] cursor-pointer" 
                    />
                    <label htmlFor="gdpr-footer" className="text-[10px] text-[#555550] hover:text-[#8A8880] transition-colors cursor-pointer uppercase tracking-tighter">
                      I accept the <Link href="/privacy-policy" className="text-[#E8A020] hover:underline">Privacy Terms</Link>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="container pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Identity */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="inline-block group" aria-label="BISHOUY Home">
              <span className="font-display text-4xl text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors tracking-tighter">
                BISHOUY<span className="text-[#E8A020]">.</span>
              </span>
            </Link>
            <p className="font-ui text-xs text-[#8A8880] leading-relaxed max-w-sm uppercase tracking-widest">
              Analytical depth for the global vanguard. <br/> 
              Independent journalism powered by neural insights.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Twitter, href: socialLinks.x, label: "X" },
                { icon: Instagram, href: socialLinks.instagram, label: "Instagram" },
                { icon: Facebook, href: socialLinks.facebook, label: "Facebook" },
                { icon: Youtube, href: socialLinks.youtube, label: "YouTube" },
                { icon: Rss, href: "/api/rss", label: "RSS" }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-[#11110F] text-[#555550] hover:text-[#E8A020] hover:bg-[#1C1C1A] border border-[#1C1C1A] rounded-xl transition-all active:scale-90"
                  aria-label={social.label}
                >
                  {social.icon === Twitter ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
                    </svg>
                  ) : <social.icon size={14} />}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Sections */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em]">Sections</h4>
              <ul className="flex flex-col gap-4">
                {CATEGORIES.map(cat => (
                  <li key={cat.slug}>
                    <Link href={`/category/${cat.slug}`} className="text-xs text-[#8A8880] hover:text-[#F2F0EB] transition-colors font-ui uppercase tracking-widest">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em]">Company</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { label: "Our Story", href: "/about" },
                  { label: "Editorial Team", href: "/editorial-team" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Advertise", href: "/advertise" },
                  { label: "Careers", href: "/careers" }
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-xs text-[#8A8880] hover:text-[#F2F0EB] transition-colors font-ui uppercase tracking-widest">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em]">Legal</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { label: "Privacy", href: "/privacy-policy" },
                  { label: "Cookies", href: "/cookie-policy" },
                  { label: "Terms", href: "/terms-of-service" },
                  { label: "Ethics", href: "/code-of-ethics" }
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-xs text-[#8A8880] hover:text-[#F2F0EB] transition-colors font-ui uppercase tracking-widest">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Stripe */}
      <div className="border-t border-[#1C1C1A]/50 bg-[#070706]">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <p className="text-[10px] text-[#555550] uppercase tracking-widest text-center md:text-left">
            © 2026 BISHOUY.COM — VANGUARD INTELLIGENCE NETWORK. <br className="md:hidden"/> ALL SIGNALS ENCRYPTED.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] text-[#333330] uppercase tracking-widest font-900">Chief Editor</span>
              <span className="text-[10px] text-[#8A8880] font-bold uppercase tracking-widest">Beshoy Toubia</span>
            </div>
            <div className="w-px h-8 bg-[#1C1C1A]" />
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] text-[#333330] uppercase tracking-widest font-900">Network Verification</span>
              <span className="text-[10px] text-[#E8A020] font-bold uppercase tracking-widest">BSY-NODE ALPHA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
