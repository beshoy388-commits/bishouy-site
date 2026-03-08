import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export default function GoogleAnalytics() {
    const GA_TRACKING_ID = "G-1ECBQX6ZY9";

    useEffect(() => {
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

        return () => {
            // Pulizia opzionale se necessario, ma i tag di analisi solitamente 
            // rimangono attivi per l'intera durata della sessione head.
        };
    }, []);

    return null;
}
