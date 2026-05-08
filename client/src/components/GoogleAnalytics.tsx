import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export default function GoogleAnalytics() {
    const GA_TRACKING_ID = "G-1ECBQX6ZY9";
    const [location] = useLocation();
    const isInitialized = useRef(false);

    useEffect(() => {
        const checkConsent = () => {
            const stored = localStorage.getItem("bishouy_cookie_consent");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return parsed.settings?.analytics === true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        };

        const initGA = () => {
            if (isInitialized.current) return;
            
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
        };

        // If already accepted, init immediately (with small delay)
        if (checkConsent()) {
            const timer = setTimeout(initGA, 1000);
            return () => clearTimeout(timer);
        }

        // Otherwise listen for the consent event
        const handleConsent = (e: any) => {
            if (e.detail?.enabled) {
                initGA();
            }
        };

        window.addEventListener("bishouy_analytics_consent", handleConsent);
        return () => window.removeEventListener("bishouy_analytics_consent", handleConsent);
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
