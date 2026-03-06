import { getDb, createSentNewsletterRecord } from "./db";
import { articles, subscribers } from "../drizzle/schema";
import { count, eq, gt, desc, and } from "drizzle-orm";
import { sendNewsletterBroadcast } from "./_core/mail";
import { logArticleAction } from "./audit";
import OpenAI from "openai";
import { ENV } from "./_core/env";

/**
 * Daily Newsletter Job
 * Generates and sends a summary of the last 24h news to all subscribers.
 */
export async function sendDailyNewsletter() {
  const db = await getDb();
  if (!db) return;

  console.log("[Newsletter] Starting daily broadcast...");

  // 1. Get articles from the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentArticles = await db
    .select()
    .from(articles)
    .where(
      and(eq(articles.status, "published"), gt(articles.publishedAt, oneDayAgo))
    )
    .orderBy(desc(articles.publishedAt))
    .limit(5);

  if (recentArticles.length === 0) {
    console.log(
      "[Newsletter] No new articles in the last 24h. Skipping broadcast."
    );
    return;
  }

  // 3. Generate AI Summary (Morning Brief)
  let morningBrief = "";
  if (ENV.openRouterApiKey) {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: ENV.openRouterApiKey,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a master editor. Summarize the following news headlines into a punchy, 3-sentence 'Morning Brief' for a high-end newsletter. Focus on the combined global impact. Use a serious, authoritative tone.",
          },
          {
            role: "user",
            content: recentArticles.map((a: any) => `- ${a.title}`).join("\n"),
          },
        ],
      });
      morningBrief = response.choices[0]?.message?.content || "";
    } catch (err) {
      console.error("[Newsletter] AI summary failed:", err);
    }
  }

  // 4. Format HTML Content
  const newsletterHtml = `
    <div style="font-family: Arial, sans-serif; color: #F2F0EB; background-color: #0F0F0E; padding: 40px; border-radius: 8px;">
      <h1 style="color: #E8A020; font-size: 28px; margin-bottom: 8px;">Daily Editorial Briefing</h1>
      <p style="color: #8A8880; font-size: 14px; margin-bottom: 20px;">Your essential summary for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      
      ${morningBrief
      ? `
      <div style="background-color: #1C1C1A; padding: 20px; border-left: 4px solid #E8A020; margin-bottom: 30px;">
        <h3 style="color: #E8A020; margin-top: 0; font-size: 14px; text-transform: uppercase;">The Morning Brief</h3>
        <p style="color: #D4D0C8; font-size: 16px; line-height: 1.6; margin-bottom: 0;">${morningBrief}</p>
      </div>
      `
      : ""
    }

      <div style="border-top: 1px solid #1C1C1A; padding-top: 20px;">
        ${recentArticles
      .map(
        (article: any) => `
          <div style="margin-bottom: 30px; border-bottom: 1px solid #1C1C1A; padding-bottom: 20px;">
            <span style="color: #E8A020; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${article.category}</span>
            <h2 style="margin: 8px 0; font-size: 20px; line-height: 1.3;">
              <a href="https://bishouy.com/articolo/${article.slug}" style="color: #F2F0EB; text-decoration: none;">${article.title}</a>
            </h2>
            <p style="color: #D4D0C8; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">${article.excerpt}</p>
            <a href="https://bishouy.com/articolo/${article.slug}" style="color: #E8A020; font-size: 12px; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Read Full Story →</a>
          </div>
        `
      )
      .join("")}
      </div>
      
      <div style="margin-top: 40px; text-align: center; border-top: 2px solid #E8A020; padding-top: 30px;">
        <p style="color: #8A8880; font-size: 13px;">Thank you for reading Bishouy.com</p>
        <p style="color: #D4D0C8; font-size: 15px; font-style: italic;">"Quality journalism for the modern world."</p>
      </div>
    </div>
  `;

  // 5. Get all subscribers
  const allSubscribers = await db.select().from(subscribers);
  if (allSubscribers.length === 0) {
    console.log("[Newsletter] No subscribers found.");
    return;
  }

  // 6. Send Broadcast
  const subject = `Bishouy.com Daily: ${recentArticles[0].title}`;
  const recipients = allSubscribers
    .filter((s: any) => !!s.unsubscribeToken)
    .map((s: any) => ({
      email: s.email,
      token: s.unsubscribeToken as string,
    }));

  // Send in batches or one by one (Brevo handles arrays, but we have a custom wrapper)
  if (recipients.length > 0) {
    await sendNewsletterBroadcast(subject, newsletterHtml, recipients);

    // Record the sent newsletter
    await createSentNewsletterRecord({
      subject,
      content: newsletterHtml,
      recipientCount: recipients.length,
    });
  }

  console.log(
    `[Newsletter] Daily broadcast sent to ${recipients.length} subscribers.`
  );
}
