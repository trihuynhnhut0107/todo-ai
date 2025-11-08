require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DetectIntentPromptTemplate } from "../prompts/detect-intent.prompt";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { IntentType } from "../enums/chat.enum";

export class LangchainService {
  private responseModel: ChatGoogleGenerativeAI;
  private detectIntentModel: ChatGoogleGenerativeAI;

  constructor() {
    this.responseModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    this.detectIntentModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async generateResponse(input: string): Promise<string> {
    try {
      const messages = [
        new HumanMessage({
          content: input,
        }),
      ];

      const response = await this.responseModel.invoke(messages);
      console.log(response);
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }

  async detectIntent(messages: string[]): Promise<{
    intent: IntentType;
    confidence: number;
    extractedInfo: Record<string, unknown>;
    missingRequiredFields: string[];
    reasoning: string;
  }> {
    try {
      // Convert string array to HumanMessage array
      const humanMessages: BaseMessage[] = messages.map(
        (msg) => new HumanMessage(msg)
      );

      // Create system prompt for intent detection
      const systemPrompt = await DetectIntentPromptTemplate.format({
        messages: messages,
      });

      // Build message array with system prompt
      const messageList: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        ...humanMessages,
      ];

      const response = await this.detectIntentModel.invoke(messageList);

      // Extract text content from response
      const rawContent =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      // Remove markdown code blocks if present
      const cleanedContent = rawContent
        .replace(/^```(?:json)?\n?/, "") // Remove opening markdown
        .replace(/\n?```$/, "") // Remove closing markdown
        .trim();

      // Parse the cleaned JSON
      const parsedResult = JSON.parse(cleanedContent);

      // Validate and cast intent to IntentType enum
      const intentValue = parsedResult.intent as string;
      if (!Object.values(IntentType).includes(intentValue as IntentType)) {
        throw new Error(
          `Invalid intent type: ${intentValue}. Expected one of: ${Object.values(IntentType).join(", ")}`
        );
      }

      return {
        intent: intentValue as IntentType,
        confidence: parsedResult.confidence,
        extractedInfo: parsedResult.extractedInfo,
        missingRequiredFields: parsedResult.missingRequiredFields,
        reasoning: parsedResult.reasoning,
      };
    } catch (error) {
      console.error("Error detecting intent in detectIntent method. Input messages:", messages, "\nError details:", error);
      throw new Error("Failed to detect user intent", { cause: error });
    }
  }
}

export default LangchainService;
