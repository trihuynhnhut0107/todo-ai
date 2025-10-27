import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import { CreateEventInput } from "./event.schema";

/**
 * Intent types supported by the chatbot
 */
export const IntentType = z.enum([
  "create_event",
  "update_event",
  "delete_event",
  "query_events",
  "unknown",
]);

export type IntentType = z.infer<typeof IntentType>;

/**
 * Detected intent with extracted data and confidence
 */
export const DetectedIntent = z.object({
  intent: IntentType,
  extractedData: z.record(z.unknown()).optional(),
  missingFields: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type DetectedIntent = z.infer<typeof DetectedIntent>;

/**
 * Chat state for LangGraph workflow
 * Manages conversation state across multiple user interactions
 */
export const ChatState = z.object({
  // Conversation messages
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      timestamp: z.string().optional(),
    })
  ),

  // Detected intent and extracted data
  intent: IntentType.nullable(),
  extractedEventData: z.custom<Partial<CreateEventInput>>().nullable(),
  missingFields: z.array(z.string()),

  // Workflow control
  status: z.enum([
    "detecting_intent",
    "collecting_info",
    "awaiting_confirmation",
    "checking_conflicts",
    "creating_event",
    "completed",
    "failed",
    "cancelled",
  ]),

  // Response to user
  responseMessage: z.string().nullable(),
  suggestedResponses: z.array(z.string()).optional(),

  // Event creation result
  createdEventId: z.string().nullable(),
  error: z.string().nullable(),

  // Conflict detection (placeholder)
  hasConflict: z.boolean(),

  // User context (from auth)
  userId: z.string().optional(),
  workspaceId: z.string().optional(),
});

export type ChatState = z.infer<typeof ChatState>;

/**
 * LangGraph State Annotation for workflow
 * This is used by LangGraph's StateGraph
 * Enhanced to support multiple workflows (event creation, common reply, general chat)
 */
export const ChatStateAnnotation = Annotation.Root({
  // === Core conversation fields ===
  messages: Annotation<
    Array<{
      role: "user" | "assistant" | "system";
      content: string;
      timestamp?: string;
    }>
  >({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  intent: Annotation<IntentType | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
  status: Annotation<
    | "detecting_intent"
    | "collecting_info"
    | "awaiting_confirmation"
    | "checking_conflicts"
    | "creating_event"
    | "completed"
    | "failed"
    | "cancelled"
  >({
    reducer: (left, right) => right ?? left,
    default: () => "detecting_intent" as const,
  }),
  responseMessage: Annotation<string | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
  suggestedResponses: Annotation<string[] | undefined>({
    reducer: (left, right) => right ?? left,
    default: () => undefined,
  }),
  error: Annotation<string | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),

  // === Workflow routing fields ===
  currentWorkflow: Annotation<
    "event_creation" | "common_reply" | "general" | null
  >({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
  threadId: Annotation<string | undefined>({
    reducer: (left, right) => right ?? left,
    default: () => undefined,
  }),

  // === User context fields ===
  userName: Annotation<string | undefined>({
    reducer: (left, right) => right ?? left,
    default: () => undefined,
  }),
  userId: Annotation<string | undefined>({
    reducer: (left, right) => right ?? left,
    default: () => undefined,
  }),
  workspaceId: Annotation<string | undefined>({
    reducer: (left, right) => right ?? left,
    default: () => undefined,
  }),
  blocked: Annotation<boolean>({
    reducer: (left, right) => right ?? left,
    default: () => false,
  }),

  // === Event creation workflow fields ===
  extractedEventData: Annotation<Partial<CreateEventInput> | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
  missingFields: Annotation<string[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  createdEventId: Annotation<string | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
  hasConflict: Annotation<boolean>({
    reducer: (left, right) => right ?? left,
    default: () => false,
  }),

  // === Common reply workflow fields (future) ===
  replyType: Annotation<"greeting" | "faq" | "help" | null>({
    reducer: (left, right) => right ?? left,
    default: () => null,
  }),
});

export type ChatStateType = typeof ChatStateAnnotation.State;

/**
 * Initial state for new chat session
 */
export const createInitialChatState = (): ChatState => ({
  messages: [],
  intent: null,
  extractedEventData: null,
  missingFields: [],
  status: "detecting_intent",
  responseMessage: null,
  suggestedResponses: undefined,
  createdEventId: null,
  error: null,
  hasConflict: false,
  userId: undefined,
  workspaceId: undefined,
});
