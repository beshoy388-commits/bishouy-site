import { dbCache } from "../cache";
import { getDb } from "../db";
import { articles } from "../../drizzle/schema";
import { eq, ne, and } from "drizzle-orm";

/**
 * Automatically injects internal links into article content.
 * Links are created when the title of another article is mentioned in the text.
 */
export async function injectInternalLinks(content: string, currentSlug: string): Promise<string> {
  const db = await getDb();
  if (!db) return content;

  // Cache article titles/slugs to avoid frequent DB hits
  const cacheKey = "internal_linking_map";
  let articleMap = dbCache.get(cacheKey) as { title: string; slug: string }[];

  if (!articleMap) {
    const results = await db
      .select({ title: articles.title, slug: articles.slug })
      .from(articles)
      .where(and(eq(articles.status, "published"), ne(articles.slug, currentSlug)));
    
    articleMap = results;
    dbCache.set(cacheKey, articleMap, 300000); // 5 minutes cache
  }

  let result = content;
  let linksAdded = 0;
  const maxLinks = 5;

  // Sort articles by title length (longest first) to prevent partial matching 
  // (e.g., matching "Apple" inside "Apple Vision Pro")
  const sortedArticles = [...articleMap].sort((a, b) => b.title.length - a.title.length);

  for (const article of sortedArticles) {
    if (linksAdded >= maxLinks) break;

    // Only match if not already inside a link or HTML tag
    // We use a simple approach: if it's not preceded by [ (markdown link start) or followed by ]( (markdown link end)
    // And not inside <a> tags.
    // For markdown, we look for [Title] not existing yet.
    
    const escapedTitle = article.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Regex matches the title only if it's not part of an existing markdown link [title](url)
    // or an existing HTML link.
    const regex = new RegExp(`(?<!\\[|href=")(?<!/article/)${escapedTitle}(?!\\]|</a>)`, 'i');

    if (regex.test(result)) {
      // Inject as a markdown link
      result = result.replace(regex, `[${article.title}](/article/${article.slug})`);
      linksAdded++;
    }
  }

  return result;
}
