import "dotenv/config";
import { syncRSSFeeds } from "../server/rss";

async function run() {
  console.log("Starting manual RSS sync test with NEW IMAGE LOGIC...");
  try {
    const result = await syncRSSFeeds();
    console.log("Sync complete:", result);
  } catch (e) {
    console.error("Sync failed:", e);
  }
}

run();
