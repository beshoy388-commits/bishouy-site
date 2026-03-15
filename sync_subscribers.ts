import { getDb } from "./server/db";
import { users, subscribers } from "./drizzle/schema";
import { eq, and, notInArray, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";

async function syncSubscribers() {
    console.log("Starting subscription synchronization...");
    const db = await getDb();
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    try {
        // 1. Get all verified users
        const verifiedUsers = await db.select().from(users).where(eq(users.isVerified, 1));
        console.log(`Found ${verifiedUsers.length} verified users.`);

        // 2. Get existing subscriber emails
        const existingSubscribers = await db.select({ email: subscribers.email }).from(subscribers);
        const existingEmails = new Set(existingSubscribers.map(s => s.email.toLowerCase()));
        console.log(`Found ${existingEmails.size} existing subscribers.`);

        let addedCount = 0;

        // 3. Add missing users
        for (const user of verifiedUsers) {
            if (user.email && !existingEmails.has(user.email.toLowerCase())) {
                const token = randomBytes(32).toString("hex");
                await db.insert(subscribers).values({
                    email: user.email,
                    unsubscribeToken: token,
                    active: 1
                });
                addedCount++;
                console.log(`Subscribed: ${user.email}`);
            }
        }

        console.log(`Synchronization complete. Added ${addedCount} new subscribers.`);
    } catch (error) {
        console.error("Synchronization failed:", error);
    }
}

syncSubscribers().then(() => process.exit(0));
