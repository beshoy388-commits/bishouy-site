import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
}

export default function SEO({
    title,
    description = "Bishouy.com — Uncompromising Journalistic Excellence in the Digital Age.",
    image = "/og-image.jpg",
    url = window.location.href,
    type = "website",
}: SEOProps) {
    const siteTitle = "BISHOUY";
    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | International News & Analysis`;

    useEffect(() => {
        // Basic meta
        document.title = fullTitle;

        const updateMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };

        updateMeta("description", description);

        // Open Graph
        updateMeta("og:title", fullTitle, "property");
        updateMeta("og:description", description, "property");
        updateMeta("og:image", image, "property");
        updateMeta("og:url", url, "property");
        updateMeta("og:type", type, "property");

        // Twitter
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", fullTitle);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", image);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        // Structured Data (JSON-LD)
        const schemaData = type === "article" ? {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "image": [image],
            "datePublished": new Date().toISOString(), // Fallback
            "author": [{
                "@type": "Organization",
                "name": "BISHOUY",
                "url": "https://bishouy.com"
            }]
        } : {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BISHOUY",
            "url": "https://bishouy.com",
            "logo": "https://bishouy.com/favicon.png"
        };

        const scriptId = "seo-json-ld";
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        if (script) {
            script.textContent = JSON.stringify(schemaData);
        } else {
            script = document.createElement("script");
            script.id = scriptId;
            script.type = "application/ld+json";
            script.textContent = JSON.stringify(schemaData);
            document.head.appendChild(script);
        }

    }, [fullTitle, description, image, url, type]);

    return null;
}
