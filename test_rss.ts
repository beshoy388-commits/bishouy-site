import { syncRSSFeeds } from "./server/rss";

async function test() {
    console.log("Starting RSS Sync Test...");
    const result = await syncRSSFeeds();
    console.log("Result:", result);
}

test().catch(console.error);
