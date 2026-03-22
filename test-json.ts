import { config } from 'dotenv';
config();
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

(async () => {
    try {
        console.log("Generating article...");
        const response = await openai.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: `JSON OUTPUT FORMAT:
                    {
                      "title": "A title",
                      "excerpt": "An excerpt",
                      "content": "Article content"
                    }`,
                },
                {
                    role: "user",
                    content: `TOPIC: Analyze the hidden structural impact of the 2026 BRICS alternative payment system on the US Dollar hegemony.`,
                },
            ],
        });

        const text = response.choices[0]?.message?.content;
        console.log("Raw LLM output:", text);
        
        if (!text) throw new Error("AI generation failed to return content.");

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        
        console.log("Clean text:", cleanText);
        
        const result = JSON.parse(cleanText);
        console.log("Parsed keys:", Object.keys(result));
    } catch (e) {
        console.error("Test failed:", e);
    }
})();
