/*
 * BISHOUY.COM — Cookie Consent Banner
 * GDPR Compliant: Explicit consent for analytics and tracking
 * Stores preference in localStorage, respects user choice
 */

import { useEffect, useState } from "react";
import { X, Settings } from "lucide-react";
import { toast } from "sonner";

type ConsentPreference = "accepted" | "rejected" | "custom" | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentPreference>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    analytics: false,
    marketing: false,
    necessary: true, // Always required
  });

  useEffect(() => {
    // Check localStorage for existing preference
    const stored = localStorage.getItem("bishouy_cookie_consent");
    if (stored) {
      const parsed = JSON.parse(stored);
      setConsent(parsed.preference);
      setCustomSettings(parsed.settings);
      // Apply stored preference
      applyConsent(parsed.settings);
    }
  }, []);

  const applyConsent = (settings: typeof customSettings) => {
    // Enable/disable analytics based on consent
    if (settings.analytics) {
      // Analytics script is already loaded in index.html with conditional data-website-id
      // This just ensures it's active
      const umami = (window as any).umami;
      if (umami?.track) {
        umami.track("page_view");
      }
    } else {
      // Disable analytics tracking
      const umami = (window as any).umami;
      if (umami) {
        (window as any).umami = undefined;
      }
    }

    // Marketing cookies would be handled similarly
    if (settings.marketing) {
      // Enable marketing pixels, retargeting, etc.
    }
  };

  const handleAcceptAll = () => {
    const settings = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem(
      "bishouy_cookie_consent",
      JSON.stringify({ preference: "accepted", settings })
    );
    setCustomSettings(settings);
    setConsent("accepted");
    applyConsent(settings);
    toast.success("Preferences saved", {
      description: "Thank you for accepting cookies.",
    });
  };

  const handleRejectAll = () => {
    const settings = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem(
      "bishouy_cookie_consent",
      JSON.stringify({ preference: "rejected", settings })
    );
    setCustomSettings(settings);
    setConsent("rejected");
    applyConsent(settings);
    toast.info("Preferences saved", {
      description: "Only essential cookies are enabled.",
    });
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      "bishouy_cookie_consent",
      JSON.stringify({ preference: "custom", settings: customSettings })
    );
    setConsent("custom");
    applyConsent(customSettings);
    setShowSettings(false);
    toast.success("Preferences saved", {
      description: "Your cookie preferences have been updated.",
    });
  };

  // Don't show banner if consent already given
  if (consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0F0F0E]/95 backdrop-blur-xl border-t border-[#1C1C1A] p-5 md:p-8 pb-32 md:pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="container max-w-6xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-headline text-lg font-bold text-[#F2F0EB] mb-1 uppercase tracking-tighter">
                Cookie <span className="text-[#E8A020]">Preferences</span>
              </h3>
              <p className="font-ui text-xs text-[#8A8880] leading-relaxed max-w-2xl">
                We use cookies to enhance your experience, analyze site traffic,
                and serve personalized content. By clicking "Accept All," you
                consent to our use of cookies. You can customize your preferences or{" "}
                <a
                  href="/privacy-policy"
                  className="text-[#E8A020] hover:underline font-bold"
                >
                  read our privacy policy
                </a>
                .
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-2 text-[#8A8880] hover:text-[#F2F0EB] font-ui text-[10px] uppercase tracking-widest transition-all px-4 py-2 border border-[#1C1C1A] rounded-md w-full sm:w-auto"
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={handleRejectAll}
                className="bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] text-[#F2F0EB] font-ui text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-md transition-all w-full sm:w-auto"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptAll}
                className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-md transition-all shadow-lg shadow-[#E8A020]/10 w-full sm:w-auto"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1C1C1A] rounded-xl p-6 border border-[#2A2A28]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold text-[#F2F0EB] uppercase tracking-tighter">
                Cookie <span className="text-[#E8A020]">Settings</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#8A8880] hover:text-[#F2F0EB] transition-colors p-2 hover:bg-[#0F0F0E] rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {/* Necessary cookies */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#0F0F0E]/50 transition-colors">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={true}
                  disabled
                  className="mt-1.5 h-4 w-4 rounded border-[#2A2A28] bg-[#0F0F0E] text-[#E8A020] cursor-not-allowed opacity-50"
                />
                <div className="flex-1">
                  <label
                    htmlFor="necessary"
                    className="font-ui text-xs font-bold text-[#F2F0EB] block mb-1 uppercase tracking-widest"
                  >
                    Essential Cookies
                  </label>
                  <p className="font-ui text-[10px] text-[#555550] leading-relaxed">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#0F0F0E]/50 transition-colors">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={customSettings.analytics}
                  onChange={e =>
                    setCustomSettings({
                      ...customSettings,
                      analytics: e.target.checked,
                    })
                  }
                  className="mt-1.5 h-4 w-4 rounded border-[#2A2A28] bg-[#0F0F0E] text-[#E8A020] cursor-pointer focus:ring-[#E8A020]/20"
                />
                <div className="flex-1">
                  <label
                    htmlFor="analytics"
                    className="font-ui text-xs font-bold text-[#F2F0EB] block mb-1 uppercase tracking-widest"
                  >
                    Analytics Cookies
                  </label>
                  <p className="font-ui text-[10px] text-[#555550] leading-relaxed">
                    Help us understand how you use our website to improve your experience.
                  </p>
                </div>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#0F0F0E]/50 transition-colors">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={customSettings.marketing}
                  onChange={e =>
                    setCustomSettings({
                      ...customSettings,
                      marketing: e.target.checked,
                    })
                  }
                  className="mt-1.5 h-4 w-4 rounded border-[#2A2A28] bg-[#0F0F0E] text-[#E8A020] cursor-pointer focus:ring-[#E8A020]/20"
                />
                <div className="flex-1">
                  <label
                    htmlFor="marketing"
                    className="font-ui text-xs font-bold text-[#F2F0EB] block mb-1 uppercase tracking-widest"
                  >
                    Marketing Cookies
                  </label>
                  <p className="font-ui text-[10px] text-[#555550] leading-relaxed">
                    Used to track your activity and show you personalized ads.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 bg-[#1C1C1A] hover:bg-[#2A2A28] border border-[#2A2A28] text-[#F2F0EB] font-ui text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-md transition-all"
              >
                Reject All
              </button>
              <button
                onClick={handleSaveCustom}
                className="flex-1 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-md transition-all shadow-lg shadow-[#E8A020]/10"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
