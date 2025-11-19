require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DetectIntentPromptTemplate } from "../prompts/prompt-templates/detect-intent.prompt";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { IntentType } from "../enums/chat.enum";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

  async generateResponse(
    input: string | Record<string, any>,
    promptTemplate?: ChatPromptTemplate
  ): Promise<string> {
    try {
      let messages: BaseMessage[];

      if (promptTemplate) {
        // If a prompt template is provided, format it with the input values
        const formattedMessages = await promptTemplate.formatMessages(
          typeof input === "string" ? { input } : input
        );
        messages = formattedMessages;
      } else {
        // Default behavior: treat input as a simple string message
        messages = [
          new HumanMessage({
            content: typeof input === "string" ? input : JSON.stringify(input),
          }),
        ];
      }

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

  async detectIntent(messages: BaseMessage[]): Promise<{
    intent: IntentType;
    confidence: number;
    extractedInfo: Record<string, unknown>;
    missingRequiredFields: string[];
    reasoning: string;
  }> {
    try {
      // Convert BaseMessage array to formatted string for the prompt
      const formattedMessages = messages
        .map((msg) => {
          const role = msg instanceof HumanMessage ? "User" : "Assistant";
          return `${role}: ${msg.content}`;
        })
        .join("\n");
      // Get current date in UTC
      const currentUTC = new Date().toISOString();

      // Create system prompt for intent detection
      const systemPrompt = await DetectIntentPromptTemplate.format({
        messages: formattedMessages,
        currentUTC: currentUTC,
      });

      console.log("System prompt:::", systemPrompt);

      // Build message array with system prompt
      const messageList: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        new HumanMessage("Detect intent and extract event information."),
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
          `Invalid intent type: ${intentValue}. Expected one of: ${Object.values(
            IntentType
          ).join(", ")}`
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
      console.error(
        "Error detecting intent in detectIntent method. Input messages:",
        messages,
        "\nError details:",
        error
      );
      throw new Error("Failed to detect user intent");
    }
  }
}

export default LangchainService;
