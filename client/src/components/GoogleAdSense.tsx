import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function GoogleAdSense() {
    const { data: settings } = trpc.settings.getAll.useQuery();

    useEffect(() => {
        if (!settings) return;

        const adsenseId = settings.find(s => s.key === "google_adsense_id")?.value;
        const autoAds = settings.find(s => s.key === "adsense_auto_ads")?.value === "true";

        if (adsenseId && adsenseId.startsWith("ca-pub-")) {
            // Remove existing script if any
            const existingScript = document.getElementById("google-adsense-script");
            if (existingScript) existingScript.remove();

            // Inject the AdSense script
            const script = document.createElement("script");
            script.id = "google-adsense-script";
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
            script.crossOrigin = "anonymous";

            if (autoAds) {
                // For Auto Ads, the script tag itself with the client ID is often enough,
                // but some configurations might need extra meta tags or initialization.
                // Google's modern snippet usually just needs the script with the client ID.
            }

            document.head.appendChild(script);

            // Verification meta tag
            let meta = document.querySelector('meta[name="google-adsense-account"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute("name", "google-adsense-account");
                document.head.appendChild(meta);
            }
            meta.setAttribute("content", adsenseId);
        }
    }, [settings]);

    return null;
}
