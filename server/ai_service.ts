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
          
          EDITORIAL GUIDELINES:
          1. TEMPORAL AWARENESS: You are writing in the real-time context of ${new Date().getFullYear()}. If your internal knowledge base has a cutoff, extrapolate logically and treat the topic as a current event happening *now* or in the recent weeks leading up to ${currentDate}. NEVER reference "last update" or "knowledge cutoff".
          2. VOICE: Authoritative, definitive, intellectually sophisticated. Analyze the *implications* for the current 2026 global landscape.
          2. CONTEXT: If the topic is news-related, use your latest training data or infer the logical progression of events up to ${currentDate}.
          3. STRUCTURE: Start with a powerful hook. Use a nut graph to explain global significance. No conclusion headers.
          4. FORMATTING: Use <h2> and <h3>. Use <strong> for emphasis. Use <blockquote> for key insights.
          5. MINIMUM LENGTH: 700-1000 words.
          6. IMAGES: Use <!-- img:center:70% --> in the middle followed by a caption in *italics*.
          7. CATEGORIES: strictly choose from: World, Politics, Economy, Technology, Culture, Sports.
          
          IMAGE PROMPT GUIDELINES:
          The 'imagePrompt' should be a highly detailed, cinematic, and photo-journalistic description without any text, logos, or flags. 
          The image must feel like a professional photograph from a 2026 news report. Focus on atmosphere, lighting, and a clear central subject.

          JSON OUTPUT FORMAT:
          {
            "title": "Headline",
            "excerpt": "Executive summary (2 sentences)",
            "content": "HTML/Markdown content",
            "tags": ["Tag1", "Tag2"],
            "category": "CategoryName",
            "imagePrompt": "Professional photo-journalistic prompt for image generation (no text/logos)",
            "seoTitle": "SEO Title",
            "seoDescription": "Meta description"
          }`,
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
