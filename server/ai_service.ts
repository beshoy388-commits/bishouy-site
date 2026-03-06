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
          Your task is to write a comprehensive, investigative-style article from scratch based on a user's topic.

          EDITORIAL GUIDELINES:
          1. VOICE: Authoritative, definitive, intellectually sophisticated.
          2. STRUCTURE: Start with a powerful hook. Use a nut graph to explain global significance. No conclusion headers.
          3. FORMATTING: Use <h2> and <h3>. Use <strong> for emphasis. Use <blockquote> for key insights.
          4. MINIMUM LENGTH: 700-1000 words.
          5. IMAGES: Use <!-- img:center:70% --> in the middle followed by a caption in *italics*.
          6. CATEGORIES: strictly choose from: World, Politics, Economy, Technology, Culture, Sports.

          JSON OUTPUT FORMAT:
          {
            "title": "Headline",
            "excerpt": "Executive summary (2 sentences)",
            "content": "HTML/Markdown content",
            "tags": ["Tag1", "Tag2"],
            "category": "CategoryName",
            "imagePrompt": "Photo-journalistic prompt for image generation",
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
