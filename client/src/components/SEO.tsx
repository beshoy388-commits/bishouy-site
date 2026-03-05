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

    }, [fullTitle, description, image, url, type]);

    return null;
}
