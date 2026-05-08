import { useEffect } from "react";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  image: string;
  slug: string;
  authorName: string;
  datePublished: string | Date;
  dateModified: string | Date;
}

export default function ArticleJsonLd({
  title,
  description,
  image,
  slug,
  authorName,
  datePublished,
  dateModified,
}: ArticleJsonLdProps) {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title.slice(0, 110),
      description: description.slice(0, 200),
      image: [image],
      datePublished: new Date(datePublished).toISOString(),
      dateModified: new Date(dateModified).toISOString(),
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: "BISHOUY",
        logo: {
          "@type": "ImageObject",
          url: "https://bishouy.com/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://bishouy.com/articolo/${slug}`,
      },
    };

    const id = "article-json-ld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [title, description, image, slug, authorName, datePublished, dateModified]);

  return null;
}
