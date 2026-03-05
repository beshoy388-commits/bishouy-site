import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { ENV } from "../server/_core/env";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const dbUrl = ENV.databaseUrl || "file:sqlite.db";
    const authToken = ENV.databaseAuthToken;

    const client = createClient({
        url: dbUrl,
        authToken: authToken || undefined
    });

    const db = drizzle(client);

    try {
        // Try to update user 2 to have username of user 1
        console.log("Attempting to cause unique constraint error...");
        await db.update(users)
            .set({ username: "local_developer" })
            .where(eq(users.id, 19));
        console.log("Success (unexpected!)");
    } catch (error: any) {
        console.log("Caught Error!");
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        console.log("Full Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
        process.exit(0);
    }
}

main().catch(console.error);
