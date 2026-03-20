import { getArticleBySlug } from "./db";

/**
 * SEO Meta Injector - Resolves SSR/Bot friendliness without full SSR.
 * Parses the incoming request, fetches article data, and injects dynamic meta tags 
 * into the index.html BEFORE sending it to the client.
 */
export async function injectSeoMeta(template: string, url: string): Promise<string> {
    // 1. Check if the URL is an article page (e.g. /article/the-slug-1234)
    const articleMatch = url.match(/\/article\/([a-z0-9-]+)/i);
    if (!articleMatch) {
        // Return original template for non-article pages (they use basic Bishouy.com meta)
        return template;
    }

    const slug = articleMatch[1];
    
    try {
        const article = await getArticleBySlug(slug);
        if (!article) return template;

        const title = `${article.title} | BISHOUY`;
        const description = article.excerpt || article.seoDescription || "Latest news on Bishouy.com";
        const image = article.image || "https://bishouy.com/og-image.jpg";
        const author = article.author || "Bishouy Editorial";

        // Inject dynamic meta into the template string
        let page = template;
        
        // Replace Title
        page = page.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        
        // Update Description & OG Meta
        page = page.replace(
            /<meta name="description" content=".*?" \/>/, 
            `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
        );
        page = page.replace(
            /<meta property="og:title" content=".*?" \/>/g, 
            `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`
        );
        page = page.replace(
            /<meta property="og:description" content=".*?" \/>/g, 
            `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
        );
        
        // Append OpenGraph & Twitter Image/Type if missing (basic index.html might have placeholders)
        const finalMeta = `
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="googlebot" content="index, follow" />
  <meta property="og:image" content="${image}" />
  <meta property="article:published_time" content="${(article.publishedAt || article.createdAt || new Date()).toISOString()}" />
  <meta property="article:author" content="${author}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${image}" />
        `;

        return page.replace('</head>', `${finalMeta}\n</head>`);
    } catch {
        return template;
    }
}
