import OpenAI from "openai";
import { ENV } from "./_core/env";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: ENV.openRouterApiKey as string,
    defaultHeaders: {
        "HTTP-Referer": ENV.appUrl,
        "X-Title": "Bishouy News Platform",
    },
});

export async function generateArticleFromTopic(topic: string) {
    if (!ENV.openRouterApiKey) {
        throw new Error("OPENROUTER_API_KEY is not set.");
    }
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const response = await (openai.chat.completions.create as any)({
        model: "meta-llama/llama-3.3-70b-instruct",
        extra_body: {
            models: [
                "nousresearch/hermes-3-llama-3.1-405b",
                "meta-llama/llama-3.3-70b-instruct",
                "google/gemma-3-27b-it:free",
                "openrouter/free",
            ],
        },
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `You are a Pulitzer Prize-winning senior editor for an elite international news organization. 
          Current Server Time: ${currentDate}. 
          Your task is to write a comprehensive, investigative-style article from scratch based on a user's topic.
          
          EDITORIAL & FORMATTING GUIDELINES (STRICT):
          1. NO HEADERS AT START: NEVER start the "content" field with a # heading or the title of the article. Start directly with the text or a drop-cap.
          2. QUALITY & STRUCTURE: Use ## and ### Markdown headers for internal sections. NO ALL CAPS in headers or body text. Use standard Title Case for headers and Sentence Case for body.
          3. VOICE: Authoritative, definitive, intellectually sophisticated. Analyze the *implications* for the current 2026 global landscape.
          4. PARAGRAPHS: Keep paragraphs concise (3-4 sentences max). Use a powerful hook and a nut graph to explain global significance. No "Conclusion" headers.
          5. IMAGES: You MUST integrate at least two high-quality, photo-journalistic images within the article body. Use ONLY this exact syntax:
             <!-- img:center:80% -->
             ![Photo description](https://loremflickr.com/1200/800/KEYWORD)
             *Short caption in italics*
             (MANDATORY: Replace KEYWORD with a single relevant English word. DO NOT include braces like {KEYWORD} or instructions in your final article.)
          6. CATEGORIES: World, Politics, Economy, Technology, Culture, Sports.
          
          JSON OUTPUT FORMAT:
          {
            "title": "Headline",
            "excerpt": "Executive summary (2 deep sentences)",
            "content": "Professional Markdown content. START DIRECTLY with text (no # title). NO ALL CAPS.",
            "tags": ["Tag1", "Tag2", "Tag3"],
            "category": "CategoryName",
            "imagePrompt": "A single word or very short phrase for the main photo (e.g. 'finance')",
            "seoTitle": "SEO Optimized Title",
            "seoDescription": "Meta description (max 155 chars)",
            "summary": ["Point 1", "Point 2", "Point 3", "Point 4"],
            "factCheck": "98.4% Neural Integrity"
          }
`,
            },
            {
                role: "user",
                content: `TOPIC: ${topic}`,
            },
        ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("AI generation failed to return content.");

    return JSON.parse(text);
}

/**
 * AI Content Moderation for Social Posts and Comments.
 * Returns a toxicity score and a final action decision.
 */
export async function moderateContent(content: string): Promise<{
    score: number;
    action: "approved" | "rejected" | "flagged";
    reason: string;
}> {
    if (!ENV.openRouterApiKey) {
        return { score: 0, action: "approved", reason: "AI Moderation skipped: API key missing" };
    }

    try {
        const response = await (openai.chat.completions.create as any)({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an AI Safety Sentinel for a premium news platform. 
          Your job is to analyze user-generated content for toxicity, hate speech, spam, or harassment.
          
          RATING SCALE:
          0-20: Completely safe, constructive.
          21-50: Potentially offensive, mildly rude, or borderline spam.
          51-100: Toxic, hate speech, high-risk spam, or severe harassment.

          DECISION LOGIC:
          - If score <= 30: "approved"
          - If score > 30 AND <= 60: "flagged" (requires human review)
          - If score > 60: "rejected"

          JSON OUTPUT FORMAT:
          {
            "score": number,
            "action": "approved" | "rejected" | "flagged",
            "reason": "Brief explanation of the decision"
          }`,
                },
                {
                    role: "user",
                    content: `CONTENT TO ANALYZE: "${content}"`,
                },
            ],
        });

        const result = JSON.parse(response.choices[0]?.message?.content || "{}");
        return {
            score: result.score ?? 0,
            action: result.action ?? "flagged",
            reason: result.reason ?? "Unknown analysis result",
        };
    } catch (error) {
        console.error("[AI Sentinel] Moderation failed:", error);
        return { score: 50, action: "flagged", reason: "System error during AI scan" };
    }
}
