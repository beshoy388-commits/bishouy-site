import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  image?: string;
  type?: "article" | "website";
}

function upsertMeta(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta({ title, description, image, type = "website" }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | BISHOUY`;
    const metaDesc = description.slice(0, 160);
    const ogDesc = description.slice(0, 200);
    const currentUrl = `https://bishouy.com${window.location.pathname}`;
    const ogImage = image || "https://bishouy.com/og-default.jpg";

    // Page title
    document.title = fullTitle;

    // Basic meta
    upsertMeta('meta[name="description"]', "name", "description", metaDesc);

    // Open Graph
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", ogDesc);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", currentUrl);
    upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", "BISHOUY");

    // Twitter Card
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", ogDesc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // Canonical
    upsertLink("canonical", currentUrl);
  }, [title, description, image, type]);
}
