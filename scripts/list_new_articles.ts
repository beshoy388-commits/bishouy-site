import "dotenv/config";
import { getDb } from "../server/db";
import { articles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function list() {
  const db = await getDb();
  const a = await db
    .select()
    .from(articles)
    .where(eq(articles.author, "Bishouy Global Team"));
  console.log("Count:", a.length);
  a.forEach(art => console.log(`- ${art.title} (Status: ${art.status})`));
  process.exit(0);
}

list();
