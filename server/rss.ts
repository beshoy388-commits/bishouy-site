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
  originalContent?: string,
  feedCategory: string = "World"
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
          content: `You are a Pulitzer Prize-winning senior foreign correspondent for an elite international news organization (akin to The Economist, NYT, or WSJ). 
            Your writing is characterized by intellectual depth, precise vocabulary, and a definitive, investigative tone.

            STRICT EDITORIAL STYLE GUIDE:
            
            1. VOICE & TONE:
               - Use the "Voice of God" authoritative tone: balanced, objective, but sharply analytical.
               - VOCABULARY: Avoid clichés and overused adjectives (stunning, unprecedented, shocked). Use precise, evocative verbs (e.g., "pivoted," "crystallized," "eroded," "underscored").
               - SENTENCE STRUCTURE: Mix short, punchy sentences with longer, complex observations to create a natural, fluid rhythm.

            2. NARRATIVE STRUCTURE:
               - THE LEDE: Start with a powerful "hook"—a compelling image, a critical number, or a defining moment. No "In a world where..." beginnings.
               - THE NUT GRAPH: Within the first 2-3 paragraphs, explicitly state *why* this story matters globally and what the stakes are.
               - THEMATIC SUBHEADINGS: Use <h2> and <h3> that are informative and punchy (e.g., "The Riyadh Pivot" instead of "Recent Background").
               - NO SUMMARY: Never use "In conclusion" or "To summarize." End with a forward-looking observation or a poignant closing thought.

            3. FORMATTING (MARCH 2024 STANDARDS):
               - PULL QUOTES: Use <blockquote> for the most impactful or provocative statements.
               - PARAGRAPHS: Keep them concise (3-4 sentences max) to ensure high readability on mobile.
               - EMPHASIS: Use <strong> sparingly for names, dates, or critical fiscal figures.
               - IMAGE PLACEMENT: Insert at least one image directive in the middle of the article using: <!-- img:left:35% -->
                 Followed immediately by a caption in *italics* like: *The shadow of the crisis looms over authoritarian regimes.*

            4. ANALYTICAL DEPTH:
               - Don't just report the "What." Analyze the "Why" (Geopolitical, Economic, or Socio-historical context).
               - Avoid passive voice. Be definitive. No rhetorical questions.

            5. CATEGORY CONTEXT:
               The source feed category is: "${feedCategory}". Align the tone (e.g., financial for Economy, strategic for International Affairs).

            6. LENGTH: Minimum 600-900 words. We are building a high-end editorial platform, not a tabloid.

            JSON OUTPUT FORMAT (MANDATORY):
            {
              "title": "A sophisticated, broad-reach headline without clickbait",
              "excerpt": "A deep, 2-sentence executive summary",
              "content": "Perfectly formatted HTML content...",
              "tags": ["Tag1", "Tag2", "Tag3"],
              "category": "Pick strictly one of: World, Politics, Economy, Technology, Culture, Sports. Use the context provided to decide correctly.",
              "imagePrompt": "A highly detailed, professional photo-journalistic image generation prompt (max 150 chars). DO NOT use generic terms, be specific about the subject of this article.",
              "seoTitle": "A search-engine optimized title (max 60 chars)",
              "seoDescription": "A compelling meta-description for search results (max 155 chars)",
              "isFeatured": boolean,
              "isBreaking": boolean
            }`,
        },
        {
          role: "user",
          content: `INPUT SOURCE:\nTitle: ${originalTitle}\nExpected Category: ${feedCategory}\nContext: ${originalContent || "No additional context available."}\n\nEDITORIAL DECISION:\n- "isFeatured": Set to true ONLY if this story has major global consequences or represents a defining moment in its category.\n- "isBreaking": Set to true ONLY if this is a time-sensitive, urgent development that just happened.`,
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

  if (process.env.DISABLE_RSS_SYNC === "true") {
    log("[RSS] Sync is DISABLED via environment variable.");
    return { success: false, message: "RSS Sync is disabled." };
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

        // Load all articles once per feed to check for duplicates efficiently
        const existingArticles = await getAllArticles(true);

        for (const item of itemsToProcess) {
          if (!item.title) continue;

          // ROBUST DUPLICATION CHECK: 
          // Check by source URL, original title, or rewritten title
          const itemUrl = item.link || item.guid;
          const alreadyExists = existingArticles.some((a: any) =>
            (itemUrl && a.sourceUrl === itemUrl) ||
            (a.sourceTitle === item.title) ||
            a.title.toLowerCase().includes(item.title!.toLowerCase().substring(0, 20))
          );

          if (alreadyExists) {
            log(`[RSS] Skipping already processed article: ${item.title}`);
            continue;
          }

          // Re-check for kill-switch before each article
          if (process.env.DISABLE_RSS_SYNC === "true") {
            log("[RSS] Interrupted by kill-switch.");
            return { success: false, message: "Sync interrupted." };
          }

          log(`[RSS] Editorial team is rewriting: ${item.title}`);

          // Aggressive rate limit protection for Free Tier (70s)
          await sleep(70000);

          const editorialPiece = await rewriteArticle(
            item.title,
            item.content || item.contentSnippet,
            feedConfig.category
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
            .substring(0, 150) // Use full allowed length
            .replace(/[^\w\s-]/gi, ' ') // More permissive cleaning
            .trim();

          const aiTags = editorialPiece.tags || [];
          const fallbackKeywords = aiTags.slice(0, 3).join(",") || aiCategory;

          const imageUrl =
            originalImage ||
            `https://loremflickr.com/1200/800/${encodeURIComponent(editorialPiece.imagePrompt?.split(' ').slice(0, 3).join(',') || fallbackKeywords || editorialPiece.title.split(' ').slice(0, 3).join(','))}/all?lock=${Math.floor(Math.random() * 1000)}`;

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
            sourceUrl: item.link || item.guid || null,
            sourceTitle: item.title,
          };

          await createArticle(articleData);

          // Add to local list to prevent duplicates within the same run
          existingArticles.push(articleData as any);

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
