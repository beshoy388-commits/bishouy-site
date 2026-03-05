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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F0E] border-t border-[#1C1C1A] p-4 md:p-6">
      <div className="container">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-headline text-sm font-700 text-[#F2F0EB] mb-2">
                Cookie Preferences
              </h3>
              <p className="font-ui text-xs text-[#8A8880] leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic,
                and serve personalized content. By clicking "Accept All," you
                consent to our use of cookies. You can customize your
                preferences or{" "}
                <a
                  href="/privacy-policy"
                  className="text-[#E8A020] hover:underline"
                >
                  read our privacy policy
                </a>
                .
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 text-[#8A8880] hover:text-[#F2F0EB] font-ui text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={handleRejectAll}
                className="bg-[#1C1C1A] hover:bg-[#222220] text-[#F2F0EB] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors whitespace-nowrap"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptAll}
                className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors whitespace-nowrap"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1C1C1A] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-sm font-700 text-[#F2F0EB]">
                Cookie Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary cookies */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={true}
                  disabled
                  className="mt-1 cursor-not-allowed"
                />
                <div className="flex-1">
                  <label
                    htmlFor="necessary"
                    className="font-ui text-sm font-600 text-[#F2F0EB] block mb-1"
                  >
                    Essential Cookies
                  </label>
                  <p className="font-ui text-xs text-[#8A8880]">
                    Required for the website to function properly. Cannot be
                    disabled.
                  </p>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-start gap-3">
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
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor="analytics"
                    className="font-ui text-sm font-600 text-[#F2F0EB] block mb-1"
                  >
                    Analytics Cookies
                  </label>
                  <p className="font-ui text-xs text-[#8A8880]">
                    Help us understand how you use our website to improve your
                    experience.
                  </p>
                </div>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-start gap-3">
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
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor="marketing"
                    className="font-ui text-sm font-600 text-[#F2F0EB] block mb-1"
                  >
                    Marketing Cookies
                  </label>
                  <p className="font-ui text-xs text-[#8A8880]">
                    Used to track your activity and show you personalized ads.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRejectAll}
                className="flex-1 bg-[#1C1C1A] hover:bg-[#222220] text-[#F2F0EB] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleSaveCustom}
                className="flex-1 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
