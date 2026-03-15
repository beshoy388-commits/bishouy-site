/*
 * BISHOUY.COM — Unsubscribe Confirmation Page
 * Displayed after clicking the unsubscribe link in a newsletter email.
 */

import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type Status = "success" | "notfound" | "error" | "loading";

export default function Unsubscribe() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const s = params.get("status");
    if (s === "success" || s === "notfound" || s === "error") {
      setStatus(s);
    } else {
      setStatus("error");
    }
  }, [search]);

  const content = {
    success: {
      icon: <CheckCircle size={56} className="text-green-500 mx-auto" />,
      title: "You've been unsubscribed.",
      message:
        "We're sorry to see you go. Your email has been removed from our newsletter list immediately. You won't receive any further emails from us.",
      cta: "You can resubscribe at any time from our homepage.",
    },
    notfound: {
      icon: <AlertCircle size={56} className="text-[#E8A020] mx-auto" />,
      title: "Link already used.",
      message:
        "This unsubscribe link has already been used or is no longer valid. If you're still receiving emails, please contact us.",
      cta: null,
    },
    error: {
      icon: <XCircle size={56} className="text-red-500 mx-auto" />,
      title: "Something went wrong.",
      message:
        "We couldn't process your request. Please try again or contact us at privacy@bishouy.com.",
      cta: null,
    },
    loading: {
      icon: null,
      title: "Processing...",
      message: "Please wait.",
      cta: null,
    },
  };

  const { icon, title, message, cta } = content[status];

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <main className="container pt-44 lg:pt-52 pb-24 flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          {/* Accent top bar */}
          <div className="w-12 h-0.5 bg-[#E8A020] mx-auto mb-10" />

          {/* Icon */}
          {icon && <div className="mb-6">{icon}</div>}

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl text-[#F2F0EB] mb-4">
            {title}
          </h1>

          {/* Message */}
          <p className="font-ui text-[#8A8880] leading-relaxed mb-8">
            {message}
          </p>

          {/* CTA note */}
          {cta && <p className="font-ui text-sm text-[#555550] mb-8">{cta}</p>}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <button className="px-8 py-3 bg-[#E8A020] text-[#0F0F0E] font-ui text-sm font-700 uppercase tracking-widest rounded-sm hover:bg-[#D4911C] transition-colors">
                Back to Home
              </button>
            </Link>
            {status === "error" && (
              <a
                href="mailto:privacy@bishouy.com"
                className="px-8 py-3 border border-[#2A2A28] text-[#8A8880] font-ui text-sm rounded-sm hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"
              >
                Contact Us
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
