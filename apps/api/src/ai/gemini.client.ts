import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export class GeminiClient {
  async generateJson<T>(prompt: string): Promise<T> {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
    });

    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text()) as T;
  }
}
