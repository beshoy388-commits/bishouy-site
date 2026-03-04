import "dotenv/config";
import { getDb } from "./server/db";
import { comments } from "./drizzle/schema";

async function run() {
    const db = await getDb();
    if (!db) {
        console.error("DB connection failed");
        return;
    }

    try {
        const res = await db.insert(comments).values({
            articleId: 2,
            userId: 1,
            content: "test error",
        }).returning();
        console.log("Success:", res);
    } catch (error: any) {
        console.error("Error inserting:", error.message);
    }
    process.exit(0);
}

run();
