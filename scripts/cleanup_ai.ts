import "dotenv/config";
import { getDb } from "../server/db";
import { articles } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";

async function cleanup() {
  console.log("Cleaning up old AI articles...");
  const db = await getDb();
  if (!db) return;

  // Clean up both authors we used
  const result = await db
    .delete(articles)
    .where(
      or(
        eq(articles.author, "Redazione AI"),
        eq(articles.author, "Autore Virtuale")
      )
    );

  console.log("Cleanup complete.");
  process.exit(0);
}

cleanup();
