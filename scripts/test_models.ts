import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { ENV } from "../server/_core/env";

const ai = new GoogleGenAI({
  apiKey: ENV.geminiApiKey as string,
});

async function listModels() {
  try {
    // In the new SDK, models are often listed through a specific method
    // But we can also just try common ones
    console.log("Testing common model names...");
    const models = [
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-lite-preview-02-05",
    ];

    for (const m of models) {
      try {
        await ai.models.generateContent({
          model: m,
          contents: [{ role: "user", parts: [{ text: "hi" }] }],
        });
        console.log(`✅ ${m} is working`);
      } catch (e: any) {
        console.log(`❌ ${m} failed: ${e.message} (Status: ${e.status})`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

listModels();
