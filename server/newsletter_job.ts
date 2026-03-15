import { getDb, createSentNewsletterRecord } from "./db";
import { articles, subscribers, sentNewsletters } from "../drizzle/schema";
import { count, eq, gt, desc, and } from "drizzle-orm";
import { sendNewsletterBroadcast } from "./_core/mail";
import { logArticleAction } from "./audit";
import OpenAI from "openai";
import { ENV } from "./_core/env";

/**
 * Daily Newsletter Job
 * Generates and sends a summary of the last 24h news to all subscribers.
 */
export async function sendDailyNewsletter(testEmail?: string) {
  const db = await getDb();
  if (!db) return;

  console.log(
    `[Newsletter] Starting ${testEmail ? "TEST " : "daily "}broadcast...`
  );

  // 0. Idempotency Check: Prevent duplicate sends on the same day (unless it's a test)
  if (!testEmail) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sentToday = await db
      .select()
      .from(sentNewsletters)
      .where(gt(sentNewsletters.createdAt, today))
      .limit(1);

    if (sentToday.length > 0) {
      console.log("[Newsletter] A broadcast was already sent today. Skipping to prevent duplicates.");
      return;
    }
  }

  // 1. Get articles from the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let recentArticles = await db
    .select()
    .from(articles)
    .where(
      and(eq(articles.status, "published"), gt(articles.publishedAt, oneDayAgo))
    )
    .orderBy(desc(articles.publishedAt))
    .limit(5);

  // Fallback: If no news in 24h, take the latest 5 published articles anyway
  // This ensures the morning briefing always has content (Bishouy Editorial choice)
  if (recentArticles.length === 0) {
    console.log("[Newsletter] No articles in last 24h. Falling back to latest 5.");
    recentArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(5);
  }

  if (recentArticles.length === 0) {
    console.log(
      "[Newsletter] No published articles found in database. Skipping broadcast."
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
              "You are a master editor. Summarize the following news headlines into a punchy, 3-sentence 'Morning Brief' for a high-end newsletter. Focus on the combined global impact. Use a serious, authoritative tone. WRITE EXCLUSIVELY IN ENGLISH.",
          },
          {
            role: "user",
            content: recentArticles.map((a: any) => `- ${a.title}`).join("\n"),
          },
        ],
      });
      morningBrief = response.choices[0]?.message?.content || "";
    } catch (err) {
      console.error("[Newsletter AI] Error generating brief:", err);
    }
  }

  const baseUrl = ENV.appUrl.replace(/\/$/, "");

  const newsletterHtml = `
    <h1 style="color: #E8A020; font-size: 28px; margin: 0 0 8px; font-weight: 900; line-height: 1.2;">Daily Editorial Briefing</h1>
    <p style="color: #8A8880; font-size: 13px; margin: 0 0 32px; letter-spacing: 1px; text-transform: uppercase;">
      Essential summary for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
    </p>
    
    ${morningBrief
      ? `
      <div style="background-color: #1A1A18; padding: 24px; border-left: 4px solid #E8A020; margin-bottom: 40px; border-radius: 4px;">
        <h3 style="color: #E8A020; margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">THE MORNING BRIEF</h3>
        <p style="color: #F2F0EB; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">"${morningBrief}"</p>
      </div>
      `
      : ""
    }

    <div style="border-top: 1px solid #1C1C1A; padding-top: 32px;">
      ${recentArticles
      .map(
        (article: any) => `
          <div style="margin-bottom: 40px; border-bottom: 1px solid #1C1C1A; padding-bottom: 32px;">
            <span style="color: #E8A020; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">${article.category}</span>
            <h2 style="margin: 0 0 12px; font-size: 22px; line-height: 1.3; font-weight: 700;">
              <a href="${baseUrl}/article/${article.slug}" style="color: #F2F0EB; text-decoration: none;">${article.title}</a>
            </h2>
            <p style="color: #8A8880; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${article.excerpt}</p>
            <a href="${baseUrl}/article/${article.slug}" style="color: #E8A020; font-size: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px;">Read Full Story →</a>
          </div>
        `
      )
      .join("")}
    </div>
    
    <div style="margin-top: 20px; text-align: center; border-top: 2px solid #E8A020; padding-top: 32px;">
      <p style="color: #8A8880; font-size: 12px; margin-bottom: 4px;">Thank you for reading <a href="${baseUrl}" style="color: #E8A020; text-decoration: none; font-weight: 700;">Bishouy.com</a></p>
      <p style="color: #555550; font-size: 13px; font-style: italic; margin: 0;">"Intelligence for the modern world."</p>
    </div>
  `;

  // 5. Get all subscribers
  const allSubscribers = await db.select().from(subscribers);

  // 6. Send Broadcast
  const subject = testEmail
    ? `[TEST] Bishouy Daily: ${recentArticles[0].title}`
    : `Bishouy.com Daily Editorial: ${recentArticles[0].title}`;

  let recipients = allSubscribers
    .filter((s: any) => (testEmail ? s.email === testEmail : s.active === 1))
    .filter((s: any) => !!s.unsubscribeToken)
    .map((s: any) => ({
      email: s.email,
      token: s.unsubscribeToken as string,
    }));

  if (testEmail && recipients.length === 0) {
    // If test email is not a subscriber, add it manually for testing
    recipients = [{ email: testEmail, token: "test-token" }];
  }

  // Send in batches or one by one
  if (recipients.length > 0) {
    await sendNewsletterBroadcast(subject, newsletterHtml, recipients);

    // Record the sent newsletter ONLY if it's a real broadcast
    if (!testEmail) {
      await createSentNewsletterRecord({
        subject,
        content: newsletterHtml,
        recipientCount: recipients.length,
      });
    }
  }

  console.log(
    `[Newsletter] ${testEmail ? "Test" : "Daily"} broadcast sent to ${recipients.length} subscribers.`
  );
}
