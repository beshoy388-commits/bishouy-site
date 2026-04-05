import { getArticleBySlug } from "./db";

/**
 * SEO Meta Injector - Resolves SSR/Bot friendliness without full SSR.
 * Parses the incoming request, fetches article data, and injects dynamic meta tags 
 * into the index.html BEFORE sending it to the client.
 */
export async function injectSeoMeta(template: string, url: string): Promise<string> {
    // 1. Check if the URL is an article page (e.g. /article/the-slug-1234)
    // 1. Article Page Match
    const articleMatch = url.match(/\/article\/([a-z0-9-]+)/i);
    // 2. Category Page Match
    const categoryMatch = url.match(/\/category\/([a-z0-9-]+)/i);
    // 3. Home Page Match
    const isHome = url === "/" || url === "";

    let title = "Bishouy.com — Global News & Analysis";
    let description = "Independent, in-depth, and accessible journalism. Breaking news on politics, economy, technology, and culture updated in real-time.";
    let image = "https://bishouy.com/og-image.jpg";

    if (articleMatch) {
      const slug = articleMatch[1];
      try {
          const article = await getArticleBySlug(slug);
          if (article) {
              title = `${article.title} | BISHOUY`;
              description = article.excerpt || "Latest news on Bishouy.com";
              image = article.image || image;
          }
      } catch (err) {
          console.error("SEO Injector Article Fetch Error:", err);
      }
    } else if (categoryMatch) {
      const cat = categoryMatch[1];
      title = `${cat.charAt(0).toUpperCase() + cat.slice(1)} Archives | BISHOUY`;
      description = `Explore our full archive of articles in the ${cat} section. Quality journalism from Bishouy.com.`;
    }

    // Inject dynamic meta into the template string
    let page = template;
    
    // Replace Title
    page = page.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    // Update Description & OG Meta
    page = page.replace(
        /<meta name="description" content=".*?" \/>/, 
        `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
    );

    let finalMeta = `
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="googlebot" content="index, follow" />
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="${image}" />
    `;

    // Inject JSON-LD Schema for Articles to help Google News crawler
    if (articleMatch && title !== "Bishouy.com — Global News & Analysis") {
       const escapedTitle = title.replace(/"/g, '\\"');
       const escapedDescription = description.replace(/"/g, '\\"');
       finalMeta += `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "${escapedTitle}",
  "image": [
    "${image}"
   ],
  "datePublished": "${new Date().toISOString()}",
  "author": [{
      "@type": "Organization",
      "name": "Bishouy Editorial",
      "url": "https://bishouy.com/"
  }]
}
</script>
       `;
    }

    return page.replace('</head>', `${finalMeta}\n</head>`);
}
