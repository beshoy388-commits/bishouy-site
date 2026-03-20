/**
 * Audit Fix Script
 * Corrects article categorization and image relevance as identified in the audit.
 */
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { articles } from "../drizzle/schema.ts";
import { eq, like } from "drizzle-orm";

async function repair() {
  const client = createClient({
    url: "file:sqlite.db", // Local or ENV.DATABASE_URL
  });
  const db = drizzle(client);

  console.log("--- Starting Database Audit Repair ---");

  // 1. Fix Autonomous Warfare Category (Audit Point 8)
  console.log("Fixing 'Autonomous Warfare' category...");
  try {
    const updatedWarfare = await db.update(articles)
      .set({ category: "World" }) // From Culture to World/Geopolitics
      .where(like(articles.title, "%Autonomous Warfare%"))
      .returning();
    
    if (updatedWarfare.length > 0) {
      console.log(`✓ Updated ${updatedWarfare.length} article(s) to 'World'.`);
    } else {
      console.log("! No matching article found for 'Autonomous Warfare'.");
    }
  } catch (e) {
    console.error("! Failed to update Warfare article:", e);
  }

  // 2. Fix Darts Article Image (Audit Point 4)
  console.log("Fixing 'Darts' article image...");
  try {
    const updatedDarts = await db.update(articles)
      .set({ 
        image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=1200&q=80",
        author: "Bishouy Sports Desk" 
      })
      .where(like(articles.title, "%Littler%"))
      .returning();
    
    if (updatedDarts.length > 0) {
      console.log(`✓ Updated ${updatedDarts.length} article(s) with better darts image.`);
    } else {
      console.log("! No matching article found for 'Darts'.");
    }
  } catch (e) {
    console.error("! Failed to update Darts article:", e);
  }

  // 3. Fix Author Naming Consistency (Audit Point 7)
  console.log("Standardizing Editorial bylines...");
  try {
    const updatedBylines = await db.update(articles)
      .set({ author: "Beshoy Toubia" })
      .where(eq(articles.author, "Bishouy Editorial"))
      .returning();
    console.log(`✓ Standardized ${updatedBylines.length} bylines.`);
  } catch (e) {
    console.error("! Failed to standardize bylines:", e);
  }

  console.log("--- Audit Repair Complete ---");
  process.exit(0);
}

repair();
