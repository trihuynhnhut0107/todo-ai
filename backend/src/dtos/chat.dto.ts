import { SenderType } from "../enums/role.enum";

/**
 * Create Message DTO
 * Data transfer object for creating a new message in a session
 */
export interface CreateMessageDto {
  /** Session ID to which this message belongs (required) */
  sessionId: string;
  /** Sender/User ID of the message author (required) */
  senderId: string;
  /** Content/text of the message (required, non-empty) */
  content: string;
  /** Sender type: USER or BOT (required) */
  senderType: SenderType;
  /** Optional metadata attached to the message */
  metadata?: Record<string, unknown>;
}

/**
 * Update Message DTO
 * Data transfer object for updating an existing message
 */
export interface UpdateMessageDto {
  /** Updated message content (optional) */
  content?: string;
  /** Updated metadata (optional) */
  metadata?: Record<string, unknown>;
}

/**
 * Message Response DTO
 * Response object containing complete message information from the API
 */
export interface MessageResponse {
  /** Unique message ID */
  id: string;
  /** Session ID this message belongs to */
  sessionId: string;
  /** Sender/User ID who created this message */
  senderId: string;
  /** Message content/text */
  content: string;
  /** Type of sender: USER or BOT */
  senderType: SenderType;
  /** Optional metadata associated with the message */
  metadata?: Record<string, unknown>;
  /** Timestamp when message was created */
  createdAt: Date;
  /** Timestamp when message was last updated */
  updatedAt: Date;
}

/**
 * Create Session DTO
 * Data transfer object for creating a new chat session
 */
export interface CreateSessionDto {
  /** User ID who owns this session (required) */
  userId: string;
}

/**
 * Session Response DTO
 * Response object containing complete session information from the API
 */
export interface SessionResponse {
  /** Unique session ID */
  id: string;
  /** Total count of messages in this session */
  messageCount: number;
  /** Timestamp when session was created */
  createdAt: Date;
  /** Timestamp when session was last updated */
  updatedAt: Date;
  /** Optional array of messages in this session (only included if requested) */
  messages?: MessageResponse[];
}

/**
 * Get Session Messages Query DTO
 * Query parameters for retrieving messages from a session
 */
export interface GetSessionMessagesDto {
  /** Number of messages to return per page (default: 50, max: 100) */
  limit?: number;
  /** Number of messages to skip for pagination (default: 0) */
  offset?: number;
  /** Sort order: "asc" (oldest first) or "desc" (newest first). Default: "asc" - Messages are ordered chronologically from oldest to newest */
  orderBy?: "asc" | "desc";
}

/**
 * Bot Input DTO
 * Simple input containing a message for the bot
 */
export interface BotInputDto {
  /** Message text to send to the bot */
  message: string;
}

/**
 * Bot Response DTO
 * Response from the bot including generated response and intent detection
 */
export interface BotResponseDto {
  /** Generated response text from the bot */
  response: string;
  /** Intent detection result */
  intent: {
    /** Detected intent category */
    intent: string;
    /** Confidence score of the intent detection (0.0 - 1.0) */
    confidence: number;
  };
}

/**
 * Chat Message DTO
 * Data transfer object for sending a message in a chat session with LangGraph
 */
export interface ChatMessageDto {
  /** Session ID for the chat */
  sessionId: string;
  /** Message content to process */
  message: string;
}

/**
 * Chat Response DTO
 * Response from the LangGraph chat processing
 */
export interface ChatResponseDto {
  /** Thread ID for tracking the conversation */
  threadId: string;
  /** Generated response from the assistant */
  response: string;
  /** Whether the chat was interrupted waiting for user input */
  isInterrupted: boolean;
  /** List of missing required fields if interrupted */
  missingFields?: string[];
  /** Message to user about what information is needed */
  interruptMessage?: string;
}

/**
 * Fulfill Interrupt DTO
 * Data transfer object for providing missing information during an interrupted chat
 */
export interface FulfillInterruptDto {
  /** Natural language message containing the missing information */
  message: string;
}

/**
 * Confirm Action DTO
 * Data transfer object for user confirmation, modification, or cancellation of an action
 */
export interface ConfirmActionDto {
  /** Natural language confirmation message (can confirm, modify, or cancel the action) */
  message: string;
}

/**
 * Generate Response DTO
 * Data transfer object for generating a response from a message
 */
export interface GenerateResponseDto {
  /** Message to generate a response for */
  message: string;
}

/**
 * Generate Response Result DTO
 * Response containing the generated text
 */
export interface GenerateResponseResultDto {
  /** Generated response text */
  response: string;
}

/**
 * Detect Intent DTO
 * Data transfer object for detecting intent from session messages
 */
export interface DetectIntentDto {
  /** Session ID containing the messages to analyze */
  sessionId: string;
}

/**
 * Intent Detection Result DTO
 * Result of intent detection analysis from full conversation history
 */
export interface IntentDetectionResult {
  /** Detected intent category (create_event, update_event, delete_event, list_events, general_chat) */
  intent: string;
  /** Confidence score of the intent detection (0.0 - 1.0) */
  confidence: number;
  /** Extracted information relevant to the detected intent */
  extractedInfo: Record<string, unknown>;
  /** List of required fields that are missing */
  missingRequiredFields: string[];
  /** Explanation of how the intent was detected and what was extracted */
  reasoning: string;
}
