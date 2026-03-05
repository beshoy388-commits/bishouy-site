import { getDb, createSentNewsletterRecord } from "./db";
import { articles, subscribers } from "../drizzle/schema";
import { count, eq, gt, desc, and } from "drizzle-orm";
import { sendNewsletterBroadcast } from "./_core/mail";
import { logArticleAction } from "./audit";

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

  // 2. Get all subscribers
  const allSubscribers = await db.select().from(subscribers);
  if (allSubscribers.length === 0) {
    console.log("[Newsletter] No subscribers found.");
    return;
  }

  // 3. Format HTML Content
  const newsletterHtml = `
    <div style="font-family: Arial, sans-serif; color: #F2F0EB;">
      <h1 style="color: #E8A020; font-size: 28px; margin-bottom: 8px;">Daily Editorial Briefing</h1>
      <p style="color: #8A8880; font-size: 14px; margin-bottom: 30px;">Your essential summary for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      
      <div style="border-top: 1px solid #1C1C1A; padding-top: 20px;">
        ${recentArticles
          .map(
            article => `
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

  // 4. Send Broadcast
  const subject = `Bishouy.com Daily: ${recentArticles[0].title}`;
  const recipients = allSubscribers
    .filter(s => !!s.unsubscribeToken)
    .map(s => ({
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
