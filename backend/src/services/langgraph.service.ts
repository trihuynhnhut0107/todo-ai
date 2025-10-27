import {
  StateGraph,
  Command,
  MemorySaver,
  START,
  END,
} from "@langchain/langgraph";
import {
  ChatStateAnnotation,
  ChatStateType,
} from "../schemas/chat-state.schema";
import { LangchainService } from "./langchain.service";
import {
  eventCreationWorkflow,
  setConflictSimulation,
} from "../workflows/event-creation.workflow";
import { WorkflowHelper } from "../helpers/workflow.helper";

/**
 * Input interface for processing messages
 */
export interface ProcessMessageInput {
  // For new conversations
  message?: string;
  userName?: string;
  userId?: string;
  workspaceId?: string;

  // For resuming interrupted workflows
  threadId?: string;
  response?: string | boolean;

  // Additional context
  blocked?: boolean;
  simulateConflict?: boolean;
}

/**
 * Output interface for processed messages
 */
export interface ProcessMessageOutput {
  threadId: string;
  status: ChatStateType["status"];
  message: string | null;
  intent?: string;
  currentWorkflow?: string;

  // Interrupt information
  interrupt?: {
    type: "collect_info" | "confirm" | "conflict_resolution";
    payload: unknown;
  };

  // Optional workflow data
  missingFields?: string[];
  suggestedResponses?: string[];
  data?: unknown; // Event data, task data, etc.
  error?: string;
}

/**
 * LanggraphService
 * Master router for all chat operations with interrupt support
 * Routes to appropriate workflows: event creation, common reply, general chat
 */
export class LanggraphService {
  private masterGraph: ReturnType<typeof this.buildMasterGraph>;
  private checkpointer: MemorySaver;
  private langchainService: LangchainService;

  constructor() {
    this.langchainService = new LangchainService();
    this.checkpointer = new MemorySaver();
    this.masterGraph = this.buildMasterGraph();
  }

  /**
   * UNIFIED ENTRY POINT
   * Handles both new messages AND interrupt resumptions
   */
  async processMessage(
    input: ProcessMessageInput
  ): Promise<ProcessMessageOutput> {
    try {
      const isResuming = !!input.threadId;
      const threadId = input.threadId || WorkflowHelper.generateThreadId();
      const config = { configurable: { thread_id: threadId } };

      // Set conflict simulation if provided
      if (input.simulateConflict !== undefined) {
        setConflictSimulation(input.simulateConflict);
      }

      let result: ChatStateType;

      if (isResuming) {
        // RESUME INTERRUPTED WORKFLOW
        result = (await this.masterGraph.invoke(
          new Command({ resume: input.response }),
          config
        )) as ChatStateType;
      } else {
        // START NEW CONVERSATION
        const initialState = this.createInitialState(input, threadId);
        result = (await this.masterGraph.invoke(
          initialState,
          config
        )) as ChatStateType;
      }

      return this.formatResponse(threadId, result);
    } catch (error) {
      console.error("Error in LanggraphService:", error);
      throw error;
    }
  }

  /**
   * Get current state of a conversation (for status checks)
   */
  async getChatStatus(
    threadId: string
  ): Promise<ProcessMessageOutput | null> {
    try {
      const config = { configurable: { thread_id: threadId } };
      const state = await this.masterGraph.getState(config);

      if (!state || !state.values) {
        return null;
      }

      return this.formatResponse(threadId, state.values as ChatStateType);
    } catch (error) {
      console.error("Error getting chat status:", error);
      return null;
    }
  }

  // ==========================================
  // MASTER ROUTING NODES
  // ==========================================

  /**
   * Node: Detect intent and determine workflow
   */
  private async detectIntentNode(
    state: ChatStateType
  ): Promise<Partial<ChatStateType>> {
    const latestMessage = state.messages[state.messages.length - 1];

    if (!latestMessage || latestMessage.role !== "user") {
      return {
        status: "failed",
        error: "No user message found",
        responseMessage: "I didn't receive any input. Please try again.",
      };
    }

    const detected = await this.langchainService.detectIntent(
      latestMessage.content
    );

    if (detected.intent === "unknown" || detected.confidence < 0.6) {
      return {
        status: "failed",
        responseMessage:
          "I'm not sure what you're asking. Could you rephrase?",
        suggestedResponses: [
          "Create an event",
          "Help me with something",
          "Just chat",
        ],
      };
    }

    // Determine which workflow to use
    const workflow = this.mapIntentToWorkflow(detected.intent);

    return {
      intent: detected.intent,
      currentWorkflow: workflow,
      status: "detecting_intent",
    };
  }

  /**
   * Map detected intent to workflow type
   */
  private mapIntentToWorkflow(
    intent: string
  ): ChatStateType["currentWorkflow"] {
    // Event-related intents
    if (
      intent === "create_event" ||
      intent === "update_event" ||
      intent === "delete_event" ||
      intent === "query_events"
    ) {
      return "event_creation";
    }

    // Future: Common reply intents
    // if (isGreeting(intent) || isFAQ(intent)) {
    //   return "common_reply";
    // }

    // Default to general chat
    return "general";
  }

  /**
   * Conditional routing function
   */
  private routeWorkflow(state: ChatStateType): string {
    // Check if user is blocked first
    if (state.blocked) {
      return "blockedUser";
    }

    // Route based on detected workflow
    switch (state.currentWorkflow) {
      case "event_creation":
        return "eventCreationWorkflow";
      case "common_reply":
        return "commonReply";
      case "general":
        return "generalChat";
      default:
        return "generalChat";
    }
  }

  // ==========================================
  // WORKFLOW DELEGATION NODES
  // ==========================================

  /**
   * Event Creation Workflow Node
   * Delegates to event-creation.workflow.ts (which handles its own interrupts)
   */
  private async eventCreationWorkflowNode(
    state: ChatStateType
  ): Promise<Partial<ChatStateType>> {
    // Delegate to event workflow
    // The event workflow handles its own interrupt() calls
    const config = { configurable: { thread_id: state.threadId } };

    const result = await eventCreationWorkflow.invoke(state, config);

    // Pass through the result (including any interrupts)
    return result;
  }

  /**
   * Common Reply Node (Future implementation)
   */
  private async commonReplyNode(
    state: ChatStateType
  ): Promise<Partial<ChatStateType>> {
    // Handle greetings, FAQs, help requests, etc.
    const lastMessage = state.messages[state.messages.length - 1];
    const content = lastMessage?.content.toLowerCase() || "";

    // Simple greeting detection
    if (
      content.includes("hello") ||
      content.includes("hi") ||
      content.includes("hey")
    ) {
      return {
        status: "completed",
        responseMessage:
          "Hello! How can I help you today? I can assist with creating events, answering questions, or just chat!",
        suggestedResponses: [
          "Create an event",
          "Tell me about features",
          "Just chat",
        ],
      };
    }

    // Default common reply
    return {
      status: "completed",
      responseMessage: "How can I help you today?",
      suggestedResponses: [
        "Create an event",
        "Ask a question",
        "Get help",
      ],
    };
  }

  /**
   * General Chat Node (Future implementation)
   */
  private async generalChatNode(
    state: ChatStateType
  ): Promise<Partial<ChatStateType>> {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!lastMessage) {
      return {
        status: "failed",
        responseMessage: "I didn't receive any message.",
      };
    }

    try {
      const responsePrompt = `You are a helpful AI assistant. Have a friendly conversation.
User: ${state.userName || "User"}
Message: "${lastMessage.content}"

Generate a helpful and friendly response. Be concise and conversational.`;

      const response = await this.langchainService.generateResponse(
        responsePrompt
      );

      return {
        status: "completed",
        responseMessage: response,
        suggestedResponses: [
          "Tell me more",
          "Create an event",
          "That's helpful",
        ],
      };
    } catch (error) {
      console.error("Error in general chat:", error);
      return {
        status: "failed",
        responseMessage:
          "I'm sorry, I encountered an error. Could you try again?",
      };
    }
  }

  /**
   * Blocked User Handler
   */
  private async blockedUserNode(
    _state: ChatStateType
  ): Promise<Partial<ChatStateType>> {
    return {
      status: "failed",
      responseMessage:
        "Your account has been blocked. Please contact support for assistance.",
      error: "User blocked",
    };
  }

  // ==========================================
  // GRAPH CONSTRUCTION
  // ==========================================

  /**
   * Build the master routing graph
   */
  private buildMasterGraph() {
    const graph = new StateGraph(ChatStateAnnotation)
      // Routing nodes
      .addNode("detectIntent", this.detectIntentNode.bind(this))

      // Workflow delegation nodes
      .addNode(
        "eventCreationWorkflow",
        this.eventCreationWorkflowNode.bind(this)
      )
      .addNode("commonReply", this.commonReplyNode.bind(this))
      .addNode("generalChat", this.generalChatNode.bind(this))
      .addNode("blockedUser", this.blockedUserNode.bind(this))

      // Entry point
      .addEdge(START, "detectIntent")

      // Route to appropriate workflow based on intent
      .addConditionalEdges(
        "detectIntent",
        this.routeWorkflow.bind(this),
        {
          eventCreationWorkflow: "eventCreationWorkflow",
          commonReply: "commonReply",
          generalChat: "generalChat",
          blockedUser: "blockedUser",
        }
      )

      // All workflows lead to end
      .addEdge("eventCreationWorkflow", END)
      .addEdge("commonReply", END)
      .addEdge("generalChat", END)
      .addEdge("blockedUser", END);

    // Compile with checkpointer for interrupt support
    return graph.compile({ checkpointer: this.checkpointer });
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Create initial state for new conversation
   */
  private createInitialState(
    input: ProcessMessageInput,
    threadId: string
  ): Partial<ChatStateType> {
    return {
      messages: input.message
        ? [
            {
              role: "user" as const,
              content: input.message,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      threadId,
      userName: input.userName,
      userId: input.userId,
      workspaceId: input.workspaceId,
      blocked: input.blocked ?? false,
      status: "detecting_intent",
      intent: null,
      currentWorkflow: null,
      extractedEventData: null,
      missingFields: [],
      responseMessage: null,
      error: null,
    };
  }

  /**
   * Format workflow result into standardized response
   */
  private formatResponse(
    threadId: string,
    result: ChatStateType & {
      __interrupt__?: Array<{
        value: {
          message?: string;
          missingFields?: string[];
          currentData?: unknown;
          eventData?: unknown;
          suggestedResponses?: string[];
          action?: string;
          conflictDetails?: string;
        };
      }>;
    }
  ): ProcessMessageOutput {
    const hasInterrupt =
      result.__interrupt__ && result.__interrupt__.length > 0;

    const response: ProcessMessageOutput = {
      threadId,
      status: result.status,
      message: hasInterrupt
        ? result.__interrupt__?.[0]?.value?.message ?? null
        : result.responseMessage,
      intent: result.intent ?? undefined,
      currentWorkflow: result.currentWorkflow ?? undefined,
      missingFields: result.missingFields,
      suggestedResponses: hasInterrupt
        ? result.__interrupt__?.[0]?.value?.suggestedResponses
        : result.suggestedResponses,
      error: result.error ?? undefined,
    };

    // Add workflow-specific data
    if (
      result.currentWorkflow === "event_creation" &&
      result.extractedEventData
    ) {
      response.data = result.extractedEventData;
    }

    // Add created event ID if available
    if (result.createdEventId) {
      response.data = {
        ...(response.data as object),
        eventId: result.createdEventId,
      };
    }

    // Add interrupt information
    if (hasInterrupt && result.__interrupt__) {
      const action = result.__interrupt__[0].value.action;
      const interruptType:
        | "collect_info"
        | "confirm"
        | "conflict_resolution" =
        action === "confirm_event"
          ? "confirm"
          : action === "conflict_resolution"
            ? "conflict_resolution"
            : "collect_info";

      response.interrupt = {
        type: interruptType,
        payload: result.__interrupt__[0].value,
      };
    }

    return response;
  }
}

export default LanggraphService;
