import "dotenv/config";
import { syncRSSFeeds } from "../server/rss";

async function run() {
  console.log("🚀 Starting High-Quality Editorial Sync...");
  try {
    const result = await syncRSSFeeds();
    console.log("✅ Sync Finished:", result);
  } catch (error) {
    console.error("❌ Sync Failed:", error);
  }
  process.exit(0);
}

run();
