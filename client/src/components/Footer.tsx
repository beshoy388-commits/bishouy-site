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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate({ email });
    }
  };

  return (
    <footer className="bg-[#0A0A09] border-t border-[#1C1C1A] mt-16">
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
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  toast.info("Social Coming Soon");
                }}
                className="text-[#555550] hover:text-[#E8A020] transition-colors"
                aria-label="Follow us on X"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
                </svg>
              </a>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  toast.info("Social Coming Soon");
                }}
                className="text-[#555550] hover:text-[#E8A020] transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  toast.info("Social Coming Soon");
                }}
                className="text-[#555550] hover:text-[#E8A020] transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  toast.info("Social Coming Soon");
                }}
                className="text-[#555550] hover:text-[#E8A020] transition-colors"
                aria-label="Subscribe to our Youtube channel"
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  toast.info("RSS Feed Coming Soon");
                }}
                className="text-[#555550] hover:text-[#E8A020] transition-colors"
                aria-label="RSS Feed"
              >
                <Rss size={16} />
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
              About Us
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Editorial Team", href: "/editorial-team" },
                { label: "Mission & Values", href: "/mission-values" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "/careers" },
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

          {/* Legal */}
          <div>
            <h4 className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Cookie Policy", href: "/privacy-policy" },
                { label: "Legal Notice", href: "/terms-of-service" },
                { label: "Advertising", href: "#" },
              ].map(item => (
                <li key={item.label}>
                  {item.href === "#" ? (
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        toast.info("Page Coming Soon");
                      }}
                      className="font-ui text-sm text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="font-ui text-sm text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1C1C1A]">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-ui text-[11px] text-[#555550]">
              © 2026 Bishouy.com — All rights reserved
            </p>
            <p className="font-ui text-[11px] text-[#555550]">
              Registered News Publication · Editor-in-Chief: Bishouy Editorial
              Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
