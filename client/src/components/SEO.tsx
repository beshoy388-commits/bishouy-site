import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
    authorName?: string;
    publishedDate?: string | Date;
    updatedDate?: string | Date;
    category?: string;
}

export default function SEO({
    title,
    description = "Bishouy.com — Uncompromising Journalistic Excellence in the Digital Age.",
    image = "/og-image.jpg",
    url = window.location.href,
    type = "website",
    authorName = "Bishouy Editorial",
    publishedDate,
    updatedDate,
    category,
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
        updateMeta("og:site_name", siteTitle, "property");

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
        canonical.setAttribute("href", url);

        // Structured Data (JSON-LD)
        const schemaData: any[] = [];

        // 1. Breadcrumb Schema
        const breadcrumbs = [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bishouy.com" }
        ];
        if (category) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 2,
                "name": category,
                "item": `https://bishouy.com/category/${category.toLowerCase()}`
            });
        }
        if (type === "article" && title) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": category ? 3 : 2,
                "name": title,
                "item": url
            });
        }

        schemaData.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs
        });

        // 2. Main Entity Schema
        if (type === "article") {
            schemaData.push({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": url
                },
                "headline": title,
                "description": description,
                "articleSection": category,
                "image": [image],
                "datePublished": publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString(),
                "dateModified": updatedDate ? new Date(updatedDate).toISOString() : (publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString()),
                "author": {
                    "@type": "Person",
                    "name": authorName,
                    "url": "https://bishouy.com/editorial-team"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "BISHOUY",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://bishouy.com/favicon.png"
                    }
                }
            });
        } else {
            schemaData.push({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "BISHOUY",
                "url": "https://bishouy.com",
                "logo": "https://bishouy.com/favicon.png",
                "sameAs": [
                    "https://twitter.com/bishouy",
                    "https://facebook.com/bishouy"
                ]
            });
        }

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

    }, [fullTitle, description, image, url, type, authorName, publishedDate, updatedDate, category]);

    return null;
}
