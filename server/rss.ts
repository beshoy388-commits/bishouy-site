import Parser from "rss-parser";
import OpenAI from "openai";
import { ENV } from "./_core/env";
import { createArticle, getArticleBySlug } from "./db";
import { InsertArticle } from "../drizzle/schema";
import { calculateReadTime } from "./utils";

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
function extractAllImageUrls(item: any): string[] {
  const urls: Set<string> = new Set();
  
  if (item.enclosure?.url) urls.add(item.enclosure.url);
  
  // Handle media:content (could be single or array)
  const media = item["media:content"];
  if (media) {
    if (Array.isArray(media)) {
      media.forEach((m: any) => { if (m.$?.url) urls.add(m.$.url); });
    } else if (media.$?.url) {
      urls.add(media.$.url);
    }
  }

  // Handle media:thumbnail
  const thumb = item["media:thumbnail"];
  if (thumb) {
    if (Array.isArray(thumb)) {
      thumb.forEach((m: any) => { if (m.$?.url) urls.add(m.$.url); });
    } else if (thumb.$?.url) {
      urls.add(thumb.$.url);
    }
  }

  // Grab all img tags from content/description/encoded
  const html = (item.content || '') + (item.description || '') + (item["content:encoded"] || '');
  const imgRegex = /<img[^>]+src="([^">]+)"/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith("//")) url = "https:" + url;
    if (url.startsWith("http")) urls.add(url);
  }

  return Array.from(urls).filter(u => u.startsWith('http') && !u.includes('favicon') && !u.includes('icon'));
}

function extractImageUrl(item: any): string | undefined {
  const images = extractAllImageUrls(item);
  return images[0];
}

/**
 * Creates a unique slug from a title.
 * Safety check: If title is accidentally a URL, strip it to the last segment.
 */
function createSlug(title: string): string {
  let cleanTitle = title;
  
  if (title.toLowerCase().startsWith('http')) {
    try {
      const url = new URL(title);
      // Take the last part of the path, or the hostname if path is empty
      cleanTitle = url.pathname.split('/').filter(Boolean).pop() || url.hostname;
    } catch {
      // Fallback: just remove common URL parts manually if URL parse fails
      cleanTitle = title.replace(/^https?:\/\/(www\.)?/, '').replace(/\//g, '-');
    }
  }

  return (
    cleanTitle
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
  feedCategory: string = "World",
  availableImages: string[] = []
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
  summaryPoints?: string[];
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
            Writing Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            Your task is to rewrite the provided news with a futuristic-analytical perspective for our 2026 audience.
            Your writing is characterized by intellectual depth, precise vocabulary, and a definitive, investigative tone.

            STRICT EDITORIAL STYLE GUIDE:
            
            1. AUTHENTIC IMAGES (CRITICAL): 
               - ALWAYS prioritize using images from the list below if not empty.
               - Available Real Source Images: ${availableImages.length > 0 ? availableImages.join(', ') : 'NONE'}
               - NEVER generate or use LoremFlickr, Pollinations, or any autogenerated URL placeholders.
               - If Available Real Source Images is 'NONE', you MUST NOT embed any <img> or ![]() tags in the content. 
               - Only use provided URLs from the list.

            2. VOICE & TONE:
               - Use the "Voice of God" authoritative tone: balanced, objective, but sharply analytical.
               - VOCABULARY: Avoid clichés and overused adjectives (stunning, unprecedented, shocked). Use precise, evocative verbs (e.g., "pivoted," "crystallized," "eroded," "underscored").
               - SENTENCE STRUCTURE: Mix short, punchy sentences with longer, complex observations to create a natural, fluid rhythm.

            2. NARRATIVE STRUCTURE:
               - THE LEDE: Start with a powerful "hook"—a compelling image, a critical number, or a defining moment. No "In a world where..." beginnings.
               - THE NUT GRAPH: Within the first 2-3 paragraphs, explicitly state *why* this story matters globally and what the stakes are.
               - THEMATIC SUBHEADINGS: Use ONLY ## and ### standard Markdown headers (e.g. "## The Riyadh Pivot"). NEVER use HTML tags, Wikipedia style (== Title ==), or other non-standard symbols for headers.
               - NO SUMMARY: Never use "In conclusion" or "To summarize." End with a forward-looking observation or a poignant closing thought.
               - TYPOGRAPHY: DO NOT use ALL CAPS for paragraphs or long sentences. Use standard Title Case for headers and Sentence Case for content.

            3. FORMATTING (MARCH 2026 STANDARDS):
               - PULL QUOTES: Use > (Markdown blockquote) for the most impactful statements.
               - PARAGRAPHS: Concise (3-4 sentences max) for mobile readability.
               - EMPHASIS: Use ** (bold) for names, dates, or fiscal figures.
               - IMAGES: If you have Available Real Source Images, embed at least 2 of them using ONLY this exact syntax:
                 <!-- img:center:80% -->
                 ![Photo description](URL_FROM_THE_LIST)
                 *Short caption in italics*
               - If Available Real Source Images is NONE, do not include any image tags or placeholders in the content.

            4. ANALYTICAL DEPTH:
               - Don't just report the "What." Analyze the "Why" (Geopolitical, Economic context).
               - Use a nut graph within the first 3 paragraphs.
               - Avoid passive voice. End with a forward-looking thought.

            5. CATEGORY CONTEXT:
               The source feed category is: "${feedCategory}". Align the tone accordingly.

            6. LENGTH: Minimum 800-1100 words.

            JSON OUTPUT FORMAT (MANDATORY):
            {
              "title": "A sophisticated, broad-reach headline without clickbait",
              "excerpt": "A deep, 2-sentence executive summary",
              "summaryPoints": ["Point 1", "Point 2", "Point 3"],
              "content": "Professional Markdown content. START DIRECTLY with text (no # title). NO ALL CAPS.",
              "tags": ["Tag1", "Tag2", "Tag3"],
              "category": "Pick strictly one of: World, Politics, Economy, Technology, Culture, Sports.",
              "imagePrompt": "A single relevant English keyword for the hero photo (e.g. finance, politics, war, economy, technology).",
              "seoTitle": "SEO optimized title (max 60 chars)",
              "seoDescription": "Compelling meta-description (max 155 chars)",
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

    // Robust JSON extraction in case the model wraps output in markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("[RSS AI] Editorial rewrite failed:", error);
    return null;
  }
}

let isSyncRunning = false;

/**
 * Main function to fetch feeds and save new articles.
 */
export async function syncRSSFeeds(isManual: boolean = false) {
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
    const { getAllArticles, createArticle, getArticleBySlug, getSiteSettings } = await import("./db");

    // Check if AI generation is enabled in settings
    let isAiEnabled = false;
    try {
      const settings = await getSiteSettings();
      isAiEnabled = settings.find(s => s.key === "ai_generation_enabled")?.value === "true";
    } catch (e) {
      log("[RSS] Could not fetch site settings. Defaulting AI Generation to DISABLED.");
    }

    // Manual sync always bypasses the setting, 
    // strictly automatic sync would honor it
    if (!isAiEnabled && !isManual) {
      log("[RSS] AI Generation is currently DISABLED in site settings. Skipping automatic sync.");
      isSyncRunning = false;
      return { success: false, message: "AI Generation is disabled in settings." };
    }

    if (!ENV.openRouterApiKey) {
      log("[RSS] Aborting: OPENROUTER_API_KEY is missing.");
      return { success: false, message: "OPENROUTER_API_KEY is missing." };
    }

    for (const feedConfig of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        log(`[RSS] Analysis: ${feed.items.length} items from ${feedConfig.url}`);

        // Focus on the top 2 most relevant items per feed to avoid flooding
        const itemsToProcess = feed.items.slice(0, 2);

        const { getArticleBySourceUrlorTitle } = await import("./db");

        for (const item of itemsToProcess) {
          if (!item.title) continue;

          // ROBUST DUPLICATION CHECK: Query DB directly for this item
          const itemUrl = item.link || item.guid;
          const existing = await getArticleBySourceUrlorTitle(itemUrl, item.title);

          if (existing) {
            log(`[RSS] Skipping article: "${item.title}" (Già presente nel database)`);
            continue;
          }

          // Re-check for kill-switch before each article
          if (process.env.DISABLE_RSS_SYNC === "true") {
            log("[RSS] Interrupted by kill-switch.");
            return { success: false, message: "Sync interrupted." };
          }

          log(`[RSS] Editorial team is rewriting: ${item.title}`);

          const allAuthenticImages = extractAllImageUrls(item);
          const editorialPiece = await rewriteArticle(
            item.title,
            item.content || item.contentSnippet,
            feedConfig.category,
            allAuthenticImages
          );

          if (!editorialPiece) {
            log(`[RSS] Failed to rewrite article: ${item.title}`);
            continue;
          }

          // CONTENT SAFETY CHECK (Moderation)
          const { moderateContent } = await import("./ai_service");
          const moderation = await moderateContent(editorialPiece.content);
          if (moderation.action === "rejected") {
            log(`[RSS] Article REJECTED by AI Sentinel: ${editorialPiece.title} - Reason: ${moderation.reason}`);
            continue;
          }

          // Rate limit protection for Free Tier (Reduced to 5s for better responsiveness)
          await sleep(5000);

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

          const NEWS_PHOTOS = [
            "photo-1504711434969-e33886168f5c", "photo-1503676260728-1c00da094a0b",
            "photo-1512428559087-560fa5ceab42", "photo-1526304640581-d334cdbbf45e",
            "photo-1460925895917-afdab827c52f", "photo-1518770660439-4636190af475",
            "photo-1550751827-4bd374c3f58b", "photo-1508921340878-ba53e1f016ec",
            "photo-1532094349884-543bc11b234d", "photo-1486406146926-c627a92ad1ab",
            "photo-1521295121783-8a321d551ad2", "photo-1451187580459-43490279c0fa"
          ];
          
          let hash = 0;
          for (let i = 0; i < finalSlug.length; i++) {
            hash = ((hash << 5) - hash) + finalSlug.charCodeAt(i);
            hash |= 0;
          }
          const index = Math.abs(hash % NEWS_PHOTOS.length);
          const photoId = NEWS_PHOTOS[index];

          const imageUrl =
            originalImage ||
            `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;

          const articleData: InsertArticle = {
            title: editorialPiece.title,
            slug: finalSlug,
            excerpt: editorialPiece.excerpt,
            content: editorialPiece.content,
            author: "Bishouy Editorial",
            authorRole: "Editorial Desk",
            category: aiCategory,
            categoryColor: categoryColors[aiCategory] || "#E8A020",
            image: imageUrl,
            seoTitle: editorialPiece.seoTitle,
            seoDescription: editorialPiece.seoDescription,
            status: "published", // Auto-publish as requested
            featured: editorialPiece.isFeatured ? 1 : 0,
            breaking: editorialPiece.isBreaking ? 1 : 0,
            tags: JSON.stringify(editorialPiece.tags),
            readTime: calculateReadTime(editorialPiece.content),
            sourceUrl: item.link || item.guid || null,
            sourceTitle: item.title,
            summary: editorialPiece.summaryPoints ? JSON.stringify(editorialPiece.summaryPoints) : null,
          };

          await createArticle(articleData);

          newArticlesCount++;
          log(`[RSS] Autonomous Article Published: ${editorialPiece.title}`);
        }
      } catch (error: any) {
        log(`[RSS] Workflow Error (${feedConfig.url}): ${error.message || error}`);
      }
    }

    log(`[RSS] Editorial Sync complete. Generati ${newArticlesCount} articoli.`);
    return { success: true, count: newArticlesCount, message: `Generati ${newArticlesCount} articoli.` };
  } catch (err) {
    console.error(`[RSS] Fatal Error:`, err);
    return { success: false, message: "Errore durante la generazione." };
  } finally {
    isSyncRunning = false;
  }
}
