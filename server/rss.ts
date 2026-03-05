import Parser from "rss-parser";
import OpenAI from "openai";
import { ENV } from "./_core/env";
import { createArticle, getArticleBySlug } from "./db";
import { InsertArticle } from "../drizzle/schema";

function log(message: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type CustomFeed = { title: string };
type CustomItem = {
  media?: string;
  enclosure?: { url: string };
  "media:content"?: { $: { url: string } };
};

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["enclosure", "enclosure"],
    ],
  },
});

const RSS_FEEDS = [
  // WORLD
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", category: "World" },
  { url: "http://rss.cnn.com/rss/edition_world.rss", category: "World" },

  // POLITICS
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
    category: "Politics",
  },
  { url: "https://www.theguardian.com/politics/rss", category: "Politics" },

  // ECONOMY
  {
    url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    category: "Economy",
  },
  {
    url: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
    category: "Economy",
  },

  // TECHNOLOGY
  { url: "https://feeds.feedburner.com/TechCrunch/", category: "Technology" },
  { url: "https://www.theverge.com/rss/index.xml", category: "Technology" },

  // CULTURE
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
    category: "Culture",
  },
  { url: "https://www.rollingstone.com/culture/feed/", category: "Culture" },

  // SPORTS
  { url: "https://www.espn.com/espn/rss/news", category: "Sports" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports" },
];

/**
 * Normalizes an RSS item's image URL.
 */
function extractImageUrl(item: any): string | undefined {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  if (item["media:content"]?.$?.url) {
    return item["media:content"].$.url;
  }
  return undefined;
}

/**
 * Creates a unique slug from a title.
 */
function createSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Math.floor(Math.random() * 10000)
  );
}

// Initialize OpenAI configured for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: ENV.openRouterApiKey as string,
  defaultHeaders: {
    "HTTP-Referer": ENV.appUrl,
    "X-Title": "Bishouy News Platform",
  },
});

/**
 * Uses LLM via OpenRouter to completely rewrite the article with high standards.
 */
async function rewriteArticle(
  originalTitle: string,
  originalContent?: string
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  imagePrompt: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  isBreaking: boolean;
} | null> {
  if (!ENV.openRouterApiKey) {
    log("[RSS] Cannot rewrite article: OPENROUTER_API_KEY is not set.");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      // We use top-tier models for Pulitzer quality, falling back to other free models if busy
      model: "meta-llama/llama-3.3-70b-instruct",
      // @ts-ignore - OpenRouter specific fallback extension
      extra_body: {
        models: [
          "nousresearch/hermes-3-llama-3.1-405b",
          "meta-llama/llama-3.3-70b-instruct",
          "google/gemma-3-27b-it:free",
          "openrouter/free",
        ],
      },
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a Pulitzer Prize-winning senior foreign correspondent for an elite international news organization. 
            Your writing is characterized by intellectual depth, perfect English, and a serious, investigative tone.

            STRICT TASK:
            Rewrite the news item provided by the user into a definitive, high-value feature article. 
            Do NOT summarize. ELABORATE and ANALYZE.

            EDITORIAL STANDARDS:
            1. STRUCTURE: 
               - START with a small "Key Insights" section using <ul> and <li>.
               - USE hierarchical subheadings (<h2> for major sections, <h3> for details).
               - USE multiple <p> paragraphs for readability.
            2. FORMATTING: Use <strong> for emphasis on key dates, names, or critical numbers.
            3. ADD DEPTH: Include a "Geopolitical Context" or "Economic Impact" section depending on the topic. 
            4. VOICE: Authoritative, objective, and purely in English.
            5. NO ATTRIBUTION: Never mention external sources (BBC, Reuters, etc.). Write as original reporting.
            6. LENGTH: Minimum 500-700 words.

            JSON OUTPUT FORMAT (MANDATORY):
            {
              "title": "A compelling, broad-reach headline",
              "excerpt": "A deep, 2-sentence executive summary",
              "content": "Perfectly formatted HTML content...",
              "tags": ["Tag1", "Tag2", "Tag3"],
              "category": "Pick strictly one of: World, Politics, Economy, Technology, Culture, Sports",
              "imagePrompt": "A highly detailed, photo-journalistic image generation prompt (max 150 chars)",
              "seoTitle": "A search-engine optimized title (max 60 chars)",
              "seoDescription": "A compelling meta-description for search results (max 155 chars)",
              "isFeatured": boolean,
              "isBreaking": boolean
            }`,
        },
        {
          role: "user",
          content: `INPUT SOURCE:\nTitle: ${originalTitle}\nContext: ${originalContent || "No additional context available."}\n\nEDITORIAL DECISION:\n- "isFeatured": Set to true ONLY if this story has major global consequences or represents a defining moment in its category.\n- "isBreaking": Set to true ONLY if this is a time-sensitive, urgent development that just happened.`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error("[RSS AI] Editorial rewrite failed:", error);
    return null;
  }
}

let isSyncRunning = false;

/**
 * Main function to fetch feeds and save new articles.
 */
export async function syncRSSFeeds() {
  if (isSyncRunning) {
    log("[RSS] Sync already in progress, skipping...");
    return { success: false, message: "Sync already in progress." };
  }

  isSyncRunning = true;
  log("[RSS] Initiating Editorial Sync...");
  let newArticlesCount = 0;

  try {
    if (!ENV.openRouterApiKey) {
      log("[RSS] Aborting: OPENROUTER_API_KEY is missing.");
      return { success: false, message: "OPENROUTER_API_KEY is missing." };
    }

    const { getAllArticles, createArticle, getArticleBySlug } = await import("./db");

    for (const feedConfig of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        log(`[RSS] Analysis: ${feed.items.length} items from ${feedConfig.url}`);

        // Focus on the top 3 most relevant items
        const itemsToProcess = feed.items.slice(0, 3);

        for (const item of itemsToProcess) {
          if (!item.title) continue;

          // BETTER DUPLICATION CHECK: 
          // Check if article with similar title already exists
          const existingArticles = await getAllArticles(true);
          const alreadyExists = existingArticles.some((a: any) =>
            a.title.toLowerCase().includes(item.title!.toLowerCase().substring(0, 20))
          );

          if (alreadyExists) {
            log(`[RSS] Skipping already processed article: ${item.title}`);
            continue;
          }

          log(`[RSS] Editorial team is rewriting: ${item.title}`);

          // Aggressive rate limit protection for Free Tier (70s)
          await sleep(70000);

          const editorialPiece = await rewriteArticle(
            item.title,
            item.content || item.contentSnippet
          );
          if (!editorialPiece) continue;

          const finalSlug = createSlug(editorialPiece.title);

          // Final sanity check
          const existsFinal = await getArticleBySlug(finalSlug);
          if (existsFinal) continue;

          const aiCategory =
            [
              "World",
              "Politics",
              "Economy",
              "Technology",
              "Culture",
              "Sports",
            ].find(
              c => c.toLowerCase() === editorialPiece.category?.toLowerCase()
            ) || "World";

          const categoryColors: Record<string, string> = {
            World: "#E8A020",
            Politics: "#C0392B",
            Economy: "#27AE60",
            Technology: "#2980B9",
            Culture: "#8E44AD",
            Sports: "#E67E22",
          };

          // IMAGE LOGIC:
          // 1. First choice: The original image from the news source (most authentic)
          // 2. Second choice: Dynamic AI-generated image from Pollinations.ai based on the AI prompt
          // 3. Third choice: Themed image from LoremFlickr based on tags
          // 4. Fallback: Professional desk news background
          let originalImage = extractImageUrl(item);

          // Ensure HTTPS for original images to avoid Mixed Content issues on the live site
          if (originalImage && originalImage.startsWith("http://")) {
            originalImage = originalImage.replace("http://", "https://");
          }

          const aiPrompt = (editorialPiece.imagePrompt || editorialPiece.title)
            .substring(0, 80) // Shorten to avoid URL issues
            .replace(/[^\w\s]/gi, ''); // Remove special chars

          const aiTags = editorialPiece.tags || [];
          const fallbackKeywords = aiTags.slice(0, 3).join(",") || aiCategory;

          // IMAGE LOGIC:
          // Use Pollinations but with a more robust fallback chain
          const imageUrl =
            originalImage ||
            `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1200&height=800&nologo=true&seed=${Math.floor(Math.random() * 1000000)}` ||
            `https://loremflickr.com/1200/800/${encodeURIComponent(fallbackKeywords)}/all`;

          const articleData: InsertArticle = {
            title: editorialPiece.title,
            slug: finalSlug,
            excerpt: editorialPiece.excerpt,
            content: editorialPiece.content,
            author: "Redazione AI",
            authorRole: "Senior AI Correspondent",
            category: aiCategory,
            categoryColor: categoryColors[aiCategory] || "#E8A020",
            image: imageUrl,
            seoTitle: editorialPiece.seoTitle,
            seoDescription: editorialPiece.seoDescription,
            status: "draft",
            featured: editorialPiece.isFeatured ? 1 : 0,
            breaking: editorialPiece.isBreaking ? 1 : 0,
            tags: JSON.stringify(editorialPiece.tags),
            publishedAt: null as any,
          };

          await createArticle(articleData);
          newArticlesCount++;
          log(`[RSS] Premium draft ready for review: ${editorialPiece.title}`);
        }
      } catch (error) {
        console.error(`[RSS] Workflow Error (${feedConfig.url}):`, error);
      }
    }

    log(`[RSS] Editorial Sync complete. ${newArticlesCount} new premium drafts.`);
    return { success: true, count: newArticlesCount };
  } catch (err) {
    console.error(`[RSS] Fatal Error:`, err);
    return { success: false, message: "Sync failed." };
  } finally {
    isSyncRunning = false;
  }
}
