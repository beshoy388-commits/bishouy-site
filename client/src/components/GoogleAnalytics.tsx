import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export default function GoogleAnalytics() {
    const GA_TRACKING_ID = "G-Y4HWX7Y000";
    const [location] = useLocation();
    const isInitialized = useRef(false);

    useEffect(() => {
        // Reduced delay to ensure faster tracking detection and data capture
        const timer = setTimeout(() => {
            // 1. Inject Gtag JS
            const script1 = document.createElement("script");
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
            document.head.appendChild(script1);

            // 2. Configure gtag
            const script2 = document.createElement("script");
            script2.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true
                });
            `;
            document.head.appendChild(script2);
            isInitialized.current = true;
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Track route changes in SPA
    useEffect(() => {
        if (isInitialized.current && typeof window.gtag === 'function') {
            window.gtag('config', GA_TRACKING_ID, {
                page_path: location,
                send_page_view: true
            });
        }
    }, [location]);

    return null;
}
