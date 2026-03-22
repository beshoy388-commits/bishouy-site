import { generateArticleFromTopic } from './server/ai_service';
import { config } from 'dotenv';
config();

(async () => {
    try {
        console.log("Generating article...");
        const result = await generateArticleFromTopic("Analyze the hidden structural impact of the 2026 BRICS alternative payment system on the US Dollar hegemony.");
        console.log("Raw object returned:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
})();
