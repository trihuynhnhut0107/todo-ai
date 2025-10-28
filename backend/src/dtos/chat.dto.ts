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
  // Optional: can add title, description, or other metadata if needed
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
