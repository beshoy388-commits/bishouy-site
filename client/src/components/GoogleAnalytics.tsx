import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export default function GoogleAnalytics() {
    const GA_TRACKING_ID = "G-Y4HWX7Y000";

    useEffect(() => {
        // Delay GA injection to give priority to main content
        const timer = setTimeout(() => {
            // 1. Inietta il primo script (Gtag JS)
            const script1 = document.createElement("script");
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
            document.head.appendChild(script1);

            // 2. Configura lo script gtag
            const script2 = document.createElement("script");
            script2.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
            `;
            document.head.appendChild(script2);
        }, 4000); // 4-second delay

        return () => clearTimeout(timer);
    }, []);

    return null;
}
