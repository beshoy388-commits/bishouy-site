import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function GoogleAdSense() {
    const { data: status } = trpc.system.getStatus.useQuery();

    useEffect(() => {
        if (!status) return;

        let adsenseId = status.adsenseId;
        const autoAds = status.adsenseAutoAds;

        if (adsenseId) {
            // Auto-format ID to ca-pub- format if missing (Point 6)
            if (!adsenseId.startsWith("ca-pub-")) {
                adsenseId = `ca-pub-${adsenseId}`;
            }
            // Delay injection to improve LCP and TBT
            const timer = setTimeout(() => {
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
            }, 3000); // 3-second delay

            return () => clearTimeout(timer);
        }
    }, [status]);

    return null;
}
