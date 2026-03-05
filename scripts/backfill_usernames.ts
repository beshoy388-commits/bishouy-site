import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, isNull } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { ENV } from "../server/_core/env";
import * as dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

async function generateUniqueUsername(baseName: string, db: ReturnType<typeof drizzle>): Promise<string> {
    // Normalize baseName: lowercase, remove non-alphanumeric chars, spaces to underscores
    let base = baseName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 20); // Keep it reasonably short

    if (!base) {
        base = "user";
    }

    let username = base;
    let counter = 1;

    while (true) {
        // Check if username exists
        const existing = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existing.length === 0) {
            // Username is unique
            return username;
        }

        // Username exists, append counter and try again
        username = `${base}${counter}`;
        counter++;
    }
}

async function main() {
    console.log("Starting username backfill...");

    const dbUrl = ENV.databaseUrl || "file:sqlite.db";
    const authToken = ENV.databaseAuthToken;

    console.log(`Connecting to database at ${dbUrl}`);

    const client = createClient({
        url: dbUrl,
        authToken: authToken || undefined
    });

    const db = drizzle(client);

    try {
        // Find all users without a username
        const usersWithoutUsername = await db.select()
            .from(users)
            .where(isNull(users.username));

        console.log(`Found ${usersWithoutUsername.length} users needing a username.`);

        if (usersWithoutUsername.length === 0) {
            console.log("Nothing to do. Exiting.");
            process.exit(0);
        }

        let updatedCount = 0;

        for (const user of usersWithoutUsername) {
            // Use name if available, otherwise email prefix, otherwise 'user'
            let baseName = "user";
            if (user.name) {
                baseName = user.name;
            } else if (user.email) {
                baseName = user.email.split("@")[0];
            }

            const uniqueUsername = await generateUniqueUsername(baseName, db);

            console.log(`Updating User ID ${user.id} (${user.email || 'No Email'}): Assigning username '@${uniqueUsername}'`);

            await db.update(users)
                .set({ username: uniqueUsername })
                .where(eq(users.id, user.id));

            updatedCount++;
        }

        console.log(`Successfully assigned usernames to ${updatedCount} users.`);

    } catch (error) {
        console.error("An error occurred during backfill:", error);
    } finally {
        console.log("Backfill complete.");
        process.exit(0);
    }
}

main().catch(console.error);
