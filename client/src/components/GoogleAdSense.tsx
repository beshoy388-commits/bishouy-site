import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function GoogleAdSense() {
    const { data: status } = trpc.system.getStatus.useQuery();

    useEffect(() => {
        if (!status) return;

        const checkConsent = () => {
            const stored = localStorage.getItem("bishouy_cookie_consent");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return parsed.settings?.marketing === true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        };

        let adsenseId = status.adsenseId;
        const autoAds = status.adsenseAutoAds;

        const injectAdSense = () => {
            if (!adsenseId) return;
            
            // Auto-format ID to ca-pub- format if missing
            if (!adsenseId.startsWith("ca-pub-")) {
                adsenseId = `ca-pub-${adsenseId}`;
            }

            // Remove existing script if any
            const existingScript = document.getElementById("google-adsense-script");
            if (existingScript) existingScript.remove();

            // Inject the AdSense script
            const script = document.createElement("script");
            script.id = "google-adsense-script";
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
            script.crossOrigin = "anonymous";

            document.head.appendChild(script);

            // Verification meta tag
            let meta = document.querySelector('meta[name="google-adsense-account"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute("name", "google-adsense-account");
                document.head.appendChild(meta);
            }
            meta.setAttribute("content", adsenseId);
        };

        // If already accepted, inject immediately
        if (checkConsent()) {
            const timer = setTimeout(injectAdSense, 3000);
            return () => clearTimeout(timer);
        }

        // Otherwise listen for the marketing consent event
        const handleConsent = (e: any) => {
            if (e.detail?.enabled) {
                injectAdSense();
            }
        };

        window.addEventListener("bishouy_marketing_consent", handleConsent);
        return () => window.removeEventListener("bishouy_marketing_consent", handleConsent);
    }, [status]);

    return null;
}
