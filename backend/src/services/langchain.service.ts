require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createEventPromptTemplate } from "../prompts/create-events.prompt";
import { CreateEventSchema, CreateEventInput } from "../schemas/event.schema";
import { DetectedIntent, IntentType } from "../schemas/chat-state.schema";
import { z } from "zod";

export class LangchainService {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-pro",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  /**
   * Detect user intent and extract partial event information
   * Returns intent type, extracted data, and list of missing required fields
   */
  async detectIntent(userInput: string): Promise<DetectedIntent> {
    try {
      // Use JSON Schema instead of Zod to avoid TypeScript type depth issues
      const intentDetectionJsonSchema = {
        type: "object",
        properties: {
          intent: {
            type: "string",
            enum: [
              "create_event",
              "update_event",
              "delete_event",
              "query_events",
              "unknown",
            ],
            description: "The detected user intent",
          },
          extractedData: {
            type: "object",
            properties: {
              name: { type: "string", description: "Event name/title" },
              description: { type: "string", description: "Event description" },
              start: {
                type: "string",
                description: "Start datetime in ISO 8601 format",
              },
              end: {
                type: "string",
                description: "End datetime in ISO 8601 format",
              },
              location: { type: "string", description: "Event location" },
              color: { type: "string", description: "Hex color code" },
              isAllDay: { type: "boolean", description: "All-day event flag" },
              recurrenceRule: {
                type: "string",
                description: "iCal RRULE format",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Event tags",
              },
              assigneeIds: {
                type: "array",
                items: { type: "string" },
                description: "Assignee IDs",
              },
            },
            description: "Extracted event data (partial or complete). Return empty object {} if no event details are mentioned.",
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence score for the detected intent",
          },
        },
        required: ["intent", "extractedData", "confidence"],
      };

      const intentPrompt = `You are an AI assistant that detects user intent for calendar operations.

Analyze the user's message and determine:
1. The intent (create_event, update_event, delete_event, query_events, or unknown)
2. Extract any event information mentioned (partial or complete)
3. Confidence score (0-1) for the detected intent

User message: "${userInput}"

Extract all available information, even if incomplete. Return an empty object {} for extractedData if no event details are mentioned.`;

      // Use JSON Schema with method parameter to avoid type inference issues
      const result = (await this.model
        .withStructuredOutput(intentDetectionJsonSchema, {
          method: "jsonSchema",
        })
        .invoke(intentPrompt)) as {
        intent: IntentType;
        extractedData: Partial<CreateEventInput>;
        confidence: number;
      };

      // Determine missing required fields for create_event intent
      const missingFields: string[] = [];
      const hasExtractedData = result.extractedData && Object.keys(result.extractedData).length > 0;

      if (result.intent === "create_event" && hasExtractedData) {
        const requiredFields: (keyof CreateEventInput)[] = [
          "name",
          "start",
          "end",
        ];
        for (const field of requiredFields) {
          if (!result.extractedData[field]) {
            missingFields.push(field);
          }
        }
      }

      return {
        intent: result.intent,
        extractedData: hasExtractedData ? result.extractedData : undefined,
        missingFields,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error("Error detecting intent:", error);
      return {
        intent: "unknown",
        extractedData: undefined,
        missingFields: [],
        confidence: 0,
      };
    }
  }

  /**
   * Extract event information from natural language input
   * Returns validated and structured event data
   */
  async extractEventData(input: string): Promise<CreateEventInput> {
    try {
      const currentDateTime = new Date().toISOString();

      // Format the prompt with variables
      const prompt = await createEventPromptTemplate.format({
        user_input: input,
        current_datetime: currentDateTime,
      });

      // Use JSON Schema instead of Zod to avoid TypeScript type depth issues
      const eventJsonSchema = {
        type: "object",
        properties: {
          name: { type: "string", description: "Event name/title" },
          description: {
            type: "string",
            description: "Detailed event description",
          },
          start: {
            type: "string",
            description: "Start datetime in ISO 8601 format",
          },
          end: {
            type: "string",
            description: "End datetime in ISO 8601 format",
          },
          location: {
            type: "string",
            description: "Physical or virtual location",
          },
          color: {
            type: "string",
            pattern: "^#[0-9A-Fa-f]{6}$",
            description: "Hex color code",
          },
          isAllDay: { type: "boolean", description: "All-day event flag" },
          recurrenceRule: {
            type: "string",
            description: "iCal RRULE format for recurring events",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Event tags",
          },
          assigneeIds: {
            type: "array",
            items: { type: "string" },
            description: "List of assignee IDs",
          },
        },
        required: ["name", "start", "end"],
      };

      const eventData = (await this.model
        .withStructuredOutput(eventJsonSchema, { method: "jsonSchema" })
        .invoke(prompt)) as CreateEventInput;

      console.log("Extracted event data:", eventData);
      return eventData;
    } catch (error) {
      console.error("Error extracting event data:", error);
      throw new Error("Failed to extract event information from input");
    }
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use extractEventData() instead for type-safe structured output
   */
  async generateResponse(input: string): Promise<string> {
    try {
      const eventData = await this.extractEventData(input);
      return JSON.stringify(eventData);
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }
}

export default LangchainService;
