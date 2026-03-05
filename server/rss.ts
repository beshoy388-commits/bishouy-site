import Parser from "rss-parser";
import { GoogleGenAI } from "@google/genai";
import { ENV } from "./_core/env";
import { createArticle, getArticleBySlug } from "./db";
import { InsertArticle } from "../drizzle/schema";
import { log } from "./vite";

type CustomFeed = { title: string };
type CustomItem = { media?: string; enclosure?: { url: string }; "media:content"?: { $: { url: string } } };

const parser = new Parser<CustomFeed, CustomItem>({
    customFields: {
        item: [
            ['media:content', 'media:content'],
            ['enclosure', 'enclosure'],
        ]
    }
});

// Using the new Gen AI SDK as per @google/genai module
const ai = new GoogleGenAI({
    apiKey: ENV.geminiApiKey || "",
});

const RSS_FEEDS = [
    { url: "https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml", category: "World" },
    { url: "https://www.ansa.it/sito/notizie/politica/politica_rss.xml", category: "Politics" },
    // Add more feeds here later if needed
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
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + Math.floor(Math.random() * 10000);
}

/**
 * Uses Gemini to completely rewrite the article.
 */
async function rewriteArticle(originalTitle: string, originalContent?: string, originalLink?: string): Promise<{ title: string, content: string, excerpt: string } | null> {
    if (!ENV.geminiApiKey) {
        log("[RSS] Cannot rewrite article: GEMINI_API_KEY is not set.");
        return null;
    }

    const prompt = `
    Sei un giornalista professionista esperto. 
    Ecco una notizia originale (titolo e/o breve descrizione). 
    Devi RISCRIVERE COMPLETAMENTE l'articolo in italiano, creando un pezzo giornalistico originale, oggettivo, chiaro e dettagliato. Non devi sembrare un bot, usa un tono professionale da agenzia di stampa internazionale. Non menzionare mai l'autore originale o l'agenzia originale.
    Scrivi almeno 4-5 paragrafi ben strutturati sfruttando le informazioni di base per creare un articolo coeso. 
    Se le informazioni originali sono scarse, arricchisci l'articolo contestualizzando l'evento (rimanendo neutrale e oggettivo).

    REGOLE DI FORMATTAZIONE:
    Rispondi SOLO in formato JSON valido, senza blocchi di codice markdown intorno (nessun \`\`\`json).
    Usa questa struttura esatta:
    {
      "title": "Un nuovo titolo accattivante e non sensazionalistico",
      "excerpt": "Un riassunto di 1 o 2 frasi",
      "content": "L'intero articolo riscritto in formato HTML usando tag <p>, <h2> o <h3> dove necessario."
    }

    Notizia Originale:
    Titolo: ${originalTitle}
    Contenuto: ${originalContent || "Nessun contenuto addizionale fornito."}
    Link (per contesto): ${originalLink || "Nessun link"}
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) return null;

        return JSON.parse(text) as { title: string, content: string, excerpt: string };

    } catch (error) {
        console.error("[RSS AI] Failed to generate article:", error);
        return null;
    }
}

/**
 * Main function to fetch feeds and save new articles.
 */
export async function syncRSSFeeds() {
    log("[RSS] Starting RSS feed sync...");
    let newArticlesCount = 0;

    if (!ENV.geminiApiKey) {
        log("[RSS] Aborting: GEMINI_API_KEY is missing. Please set it in your .env file.");
        return { success: false, message: "GEMINI_API_KEY is missing." };
    }

    for (const feedConfig of RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedConfig.url);
            log(`[RSS] Fetched ${feed.items.length} items from ${feedConfig.url}`);

            // Only process the 3 most recent items per feed to avoid hitting rate limits too quickly
            const itemsToProcess = feed.items.slice(0, 3);

            for (const item of itemsToProcess) {
                if (!item.title) continue;

                const slug = createSlug(item.title);

                // Prevent exact duplicates (basic check before AI generation)
                const exists = await getArticleBySlug(slug);
                if (exists) {
                    log(`[RSS] Article already exists (by approximate slug check): ${item.title}`);
                    continue;
                }

                log(`[RSS] Processing new item: ${item.title}`);

                const generated = await rewriteArticle(item.title, item.content || item.contentSnippet, item.link);
                if (!generated) {
                    log(`[RSS] Skipping item due to AI generation failure: ${item.title}`);
                    continue;
                }

                const generatedSlug = createSlug(generated.title);

                // Final duplicate check post-generation
                const existsAfterGen = await getArticleBySlug(generatedSlug);
                if (existsAfterGen) {
                    continue;
                }

                const imageUrl = extractImageUrl(item) || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"; // Fallback image

                const articleData: InsertArticle = {
                    title: generated.title,
                    slug: generatedSlug,
                    excerpt: generated.excerpt,
                    content: generated.content,
                    author: "Redazione AI",
                    authorRole: "Autore Virtuale",
                    category: feedConfig.category,
                    image: imageUrl,
                    status: "published",
                    publishedAt: new Date(),
                };

                await createArticle(articleData);
                newArticlesCount++;
                log(`[RSS] Saved new article: ${generated.title}`);
            }

        } catch (error) {
            console.error(`[RSS] Error processing feed ${feedConfig.url}:`, error);
        }
    }

    log(`[RSS] Sync complete. Generated ${newArticlesCount} new articles.`);
    return { success: true, count: newArticlesCount };
}
