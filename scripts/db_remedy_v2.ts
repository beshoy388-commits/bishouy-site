/**
 * Audit Remedy v2 - Database & Content Restoration
 */
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { articles, siteSettings, users } from "../drizzle/schema.ts";
import { eq, like, or, and, not, isNull } from "drizzle-orm";

async function remedy() {
  const client = createClient({ url: "file:sqlite.db" });
  const db = drizzle(client);

  console.log("--- Starting Remediation v2 ---");

  // 1. Fix System Settings (Point 4)
  console.log("Initializing Critical Settings...");
  const defaults = [
    { key: "site_name", value: "Bishouy.com — Global News & Deep Analysis" },
    { key: "site_description", value: "In-depth journalism covering politics, technology, economy and culture with neural precision." },
    { key: "owner_email", value: "max@bishouy.com" },
    { key: "social_x", value: "https://x.com/bishouy_news" },
    { key: "social_instagram", value: "https://instagram.com/bishouy_com" },
    { key: "meta_keywords", value: "news, politics, technology, middle east, global economy, sports" },
    { key: "google_analytics_id", value: "G-Y4HWX7Y000" } // Point 5: Move from GTM
  ];

  for (const d of defaults) {
    try {
      await db.insert(siteSettings).values({ ...d, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: d.value } });
      console.log(`✓ Initialized ${d.key}`);
    } catch (e) { console.error(`! Setting ${d.key} failed:`, e); }
  }

  // 2. Eradicate Loremflickr (Point 1)
  console.log("Replacing Placeholder Images (Loremflickr)...");
  const randomImages = [
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80", // Politics
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80", // Tech
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80", // Economy
    "https://images.unsplash.com/photo-1547891269-045ad91d039b?w=1200&q=80", // Culture
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80", // News
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80"  // World
  ];

  try {
    const broken = await db.select().from(articles).where(like(articles.image, "%loremflickr%"));
    for (const a of broken) {
      const idx = Math.floor(Math.random() * randomImages.length);
      await db.update(articles).set({ image: randomImages[idx] }).where(eq(articles.id, a.id));
    }
    console.log(`✓ Replaced ${broken.length} placeholder images.`);
  } catch (e) { console.error("! Image repair failed:", e); }

  // 3. Cleanup Test Users (Point 10)
  console.log("Removing Test/Duplicate Accounts...");
  try {
    const testPatterns = ["%HSHS%", "%JJJD%", "%IJSI%", "%MAH%", "%J3E%", "%JED%", "%DJJD%", "%DFE%"];
    for (const pattern of testPatterns) {
       await db.delete(users).where(like(users.name, pattern));
    }
    // Delete by specific ID if known, or just patterns
    console.log("✓ Cleanup of test identities complete.");
  } catch (e) { console.error("! User cleanup failed:", e); }

  // 4. Fixing Warfare Article (Point 14)
  console.log("Correcting Warfare categorization...");
  try {
    await db.update(articles)
      .set({ category: "Technology" })
      .where(like(articles.title, "%Autonomous Warfare%"));
    console.log("✓ Updated Warfare article.");
  } catch (e) { console.error("! Warfare update failed:", e); }

  console.log("--- Remediation v2 Complete ---");
  process.exit(0);
}

remedy();
