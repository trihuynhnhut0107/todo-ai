require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createEventPromptTemplate } from "../prompts/create-events.prompt";
import { DetectIntentPromptTemplate } from "../prompts/detect-intent.prompt";
import { IntentDetectionResult } from "../types/chat.types";

export class LangchainService {
  private responseModel: ChatGoogleGenerativeAI;
  private detectIntentModel: ChatGoogleGenerativeAI;

  constructor() {
    this.responseModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-pro",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    this.detectIntentModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-pro",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async generateResponse(input: string): Promise<string> {
    try {
      const currentDateTime = new Date().toISOString();
      const prompt = await createEventPromptTemplate.format({
        user_input: input,
        current_datetime: currentDateTime,
      });

      const response = await this.responseModel.invoke(prompt);
      console.log(response);
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }

  async detectIntent(userMessage: string): Promise<IntentDetectionResult> {
    try {
      const prompt = await DetectIntentPromptTemplate.format({
        user_input: userMessage,
      });

      const response = await this.detectIntentModel.invoke(prompt);
      const intentText =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      const detectedIntent = this.parseIntentFromResponse(intentText);
      const confidence = this.calculateConfidence(intentText);

      return {
        intent: detectedIntent,
        confidence: confidence,
      };
    } catch (error) {
      console.error("Error detecting intent:", error);
      throw new Error("Failed to detect user intent");
    }
  }

  private parseIntentFromResponse(response: string): string {
    const lowerResponse = response.toLowerCase().trim();
    const validIntents = [
      "create_todo",
      "update_todo",
      "delete_todo",
      "list_todos",
      "general_chat",
    ];

    for (const intent of validIntents) {
      if (lowerResponse.includes(intent)) {
        return intent;
      }
    }

    return "general_chat";
  }

  private calculateConfidence(response: string): number {
    const lowerResponse = response.toLowerCase().trim();
    const validIntents = [
      "create_todo",
      "update_todo",
      "delete_todo",
      "list_todos",
      "general_chat",
    ];

    for (const intent of validIntents) {
      if (lowerResponse.includes(intent)) {
        const exactMatch = lowerResponse === intent;
        return exactMatch ? 1.0 : 0.9;
      }
    }

    return 0.5;
  }
}

export default LangchainService;
