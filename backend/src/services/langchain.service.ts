require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DetectIntentPromptTemplate } from "../prompts/prompt-templates/detect-intent.prompt";
import { agentAssistantPrompt } from "../prompts/agent-response.prompt";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { IntentType } from "../enums/chat.enum";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { allTools } from "../tools/index";
import { createAgent } from "langchain";
import { GoogleRequestLogger } from "@langchain/google-common";
import { ChatOpenAI, OpenAI } from "@langchain/openai";

export class LangchainService {
  private responseModel: ChatGoogleGenerativeAI;
  private detectIntentModel: ChatGoogleGenerativeAI;
  private agent: any;

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

    // Create agent with tools for event management
    const agentModel = new ChatOpenAI({
      model: "gpt-3.5-turbo",
      maxRetries: 2,
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.agent = createAgent({
      model: agentModel,
      tools: allTools,
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

  /**
   * Generate response using agent with tool access
   * Handles event creation, querying, and management through natural language
   *
   * @param sessionMessages Array of LangChain BaseMessage objects with full conversation history
   * @param userId The ID of the user making the request
   * @returns Agent response and list of tools used
   */
  /**
   * Generate response using agent with tool access
   * Handles event creation, querying, and management through natural language
   *
   * @param sessionMessages Array of LangChain BaseMessage objects with full conversation history
   * @param userId The ID of the user making the request
   * @param systemPrompt Optional dynamic system prompt to use. If not provided, uses default.
   * @returns Agent response and list of tools used
   */
  async generateAgentResponse(
    sessionMessages: BaseMessage[],
    userId: string,
    systemPrompt?: string
  ): Promise<{
    response: string;
    toolsUsed: string[];
  }> {
    try {
      // Convert session messages to formatted string for context
      let formattedSessionMessages = sessionMessages
        .map((msg) => {
          const role = msg instanceof HumanMessage ? "User" : "Assistant";
          const content =
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content);
          return `${role}: ${content}`;
        })
        .join("\n");

      // Add userId context to the formatted messages for the agent
      formattedSessionMessages = `User ID: ${userId}\n\n${formattedSessionMessages}`;

      // Construct prompt template dynamically
      // If systemPrompt is provided, use it. Otherwise, use the imported default.
      let promptTemplate = agentAssistantPrompt;

      if (systemPrompt) {
        promptTemplate = ChatPromptTemplate.fromMessages([
          ["system", systemPrompt],
          ["human", "{messages}"],
        ]);
      }

      // Format messages using the agent assistant prompt template
      const promptMessages = await promptTemplate.formatMessages({
        messages: formattedSessionMessages,
      });

      const input = {
        messages: promptMessages,
      };

      // Invoke the agent with formatted prompt and full session history
      const result = await this.agent.invoke(input);

      // Extract the final message from the agent
      // The result.messages array contains the full conversation history
      const messages = result.messages || [];
      if (messages.length === 0) {
        throw new Error("No messages returned from agent");
      }

      const lastMessage = messages[messages.length - 1];

      // Extract response text - handle both string content and structured responses
      let response = "";
      if (lastMessage?.content) {
        response =
          typeof lastMessage.content === "string"
            ? lastMessage.content
            : JSON.stringify(lastMessage.content);
      } else if (result.structuredResponse) {
        // Handle structured response format if configured
        response = JSON.stringify(result.structuredResponse);
      } else {
        // Fallback: construct response from available data
        response = "Task processed successfully";
      }

      // Extract tool names used during execution
      const toolsUsed: string[] = [];
      for (const message of messages) {
        // Check if message has tool_calls array
        if (message?.tool_calls && Array.isArray(message.tool_calls)) {
          toolsUsed.push(
            ...message.tool_calls.map((call: any) => call.name || "unknown")
          );
        }
      }

      return {
        response,
        toolsUsed: [...new Set(toolsUsed)], // Remove duplicates
      };
    } catch (error) {
      console.error("Error generating agent response:", error);
      throw new Error("Failed to generate agent response");
    }
  }
}

export default LangchainService;
