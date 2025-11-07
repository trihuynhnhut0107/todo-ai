import { SenderType } from "../enums/role.enum";

export interface CreateMessageDto {
  sessionId: string;
  senderId: string;
  content: string;
  senderType: SenderType;
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageDto {
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageResponse {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  senderType: SenderType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionDto {
  userId: string;
}

export interface SessionResponse {
  id: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  messages?: MessageResponse[];
}

export interface GetSessionMessagesDto {
  limit?: number;
  offset?: number;
  orderBy?: "asc" | "desc";
}

export interface BotInputDto {
  message: string;
}

export interface BotResponseDto {
  response: string;
  intent: {
    intent: string;
    confidence: number;
  };
}

// New DTOs for chat flow with LangGraph
export interface ChatMessageDto {
  sessionId: string;
  userId: string;
  message: string;
}

export interface ChatResponseDto {
  threadId: string;
  response: string;
  isInterrupted: boolean;
  missingFields?: string[];
  interruptMessage?: string;
}

export interface FulfillInterruptDto {
  message: string; // Natural language message with missing information
}

export interface ConfirmActionDto {
  message: string; // Natural language confirmation/modification/cancellation
}

// DTOs for separate generate and detect endpoints
export interface GenerateResponseDto {
  message: string;
}

export interface GenerateResponseResultDto {
  response: string;
}

export interface DetectIntentDto {
  sessionId: string;
}

export interface IntentDetectionResult {
  intent: string;
  confidence: number;
  extractedInfo: Record<string, unknown>;
  missingRequiredFields: string[];
  reasoning: string;
}
