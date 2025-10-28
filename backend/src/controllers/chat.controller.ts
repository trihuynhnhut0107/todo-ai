import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { ChatService } from "../services/chat.service";
import { LangchainService } from "../services/langchain.service";
import {
  CreateMessageDto,
  UpdateMessageDto,
  MessageResponse,
  SessionResponse,
  GetSessionMessagesDto,
  BotInputDto,
  BotResponseDto,
} from "../dtos/chat.dto";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";

@Route("api/chat")
@Tags("Chat")
export class ChatController extends Controller {
  private chatService = new ChatService();
  private langchainService = new LangchainService();

  /**
   * Test bot response with intent detection
   * @summary Test chatbot response and intent detection
   * @param input Bot input with user message
   * @returns Bot response with detected intent
   */
  @Post("bot")
  @SuccessResponse("200", "Bot response generated successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async testBotResponse(
    @Body() input: BotInputDto
  ): Promise<ApiResponse<BotResponseDto>> {
    try {
      if (!input.message || input.message.trim().length === 0) {
        this.setStatus(400);
        throw new Error("Message field is required and cannot be empty");
      }

      const response = await this.langchainService.generateResponse(
        input.message
      );
      const intentResult = await this.langchainService.detectIntent(
        input.message
      );

      return {
        success: true,
        message: "Bot response generated successfully",
        data: {
          response,
          intent: intentResult,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("required")) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Create a new chat session
   * @summary Create a new session
   * @returns Newly created session
   */
  @Post("sessions")
  @SuccessResponse("201", "Session created successfully")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async createSession(): Promise<ApiResponse<SessionResponse>> {
    try {
      const session = await this.chatService.createSession();

      this.setStatus(201);
      return {
        success: true,
        message: "Session created successfully",
        data: session,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  /**
   * Get all chat sessions
   * @summary Get all sessions with pagination
   * @param limit Number of sessions per page (default: 10)
   * @param offset Number of sessions to skip (default: 0)
   * @returns List of sessions
   */
  @Get("sessions")
  @SuccessResponse("200", "Sessions retrieved successfully")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getAllSessions(
    @Query() limit?: number,
    @Query() offset?: number
  ): Promise<
    ApiResponse<{
      sessions: SessionResponse[];
      total: number;
    }>
  > {
    try {
      const result = await this.chatService.getAllSessions(
        limit || 10,
        offset || 0
      );

      return {
        success: true,
        message: "Sessions retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  /**
   * Get session by ID
   * @summary Get session details
   * @param sessionId Session ID
   * @param includeMessages Include messages in response (default: false)
   * @returns Session details
   */
  @Get("sessions/{sessionId}")
  @SuccessResponse("200", "Session retrieved successfully")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getSessionById(
    @Path() sessionId: string,
    @Query() includeMessages?: boolean
  ): Promise<ApiResponse<SessionResponse>> {
    try {
      const session = await this.chatService.getSessionById(
        sessionId,
        includeMessages || false
      );

      return {
        success: true,
        message: "Session retrieved successfully",
        data: session,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Delete session
   * @summary Delete session and all associated messages
   * @param sessionId Session ID
   * @returns Success message
   */
  @Delete("sessions/{sessionId}")
  @SuccessResponse("200", "Session deleted successfully")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async deleteSession(
    @Path() sessionId: string
  ): Promise<ApiResponse<void>> {
    try {
      await this.chatService.deleteSession(sessionId);

      return {
        success: true,
        message: "Session deleted successfully",
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Create a new message in a session
   * @summary Create message
   * @param sessionId Session ID
   * @param createDto Message creation details
   * @returns Newly created message
   */
  @Post("sessions/{sessionId}/messages")
  @SuccessResponse("201", "Message created successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async createMessage(
    @Path() sessionId: string,
    @Body() createDto: CreateMessageDto
  ): Promise<ApiResponse<MessageResponse>> {
    try {
      // Validate sessionId matches
      if (createDto.sessionId !== sessionId) {
        this.setStatus(400);
        throw new Error("Session ID in URL and body must match");
      }

      // Validate required fields
      if (!createDto.senderId || !createDto.content || !createDto.senderType) {
        this.setStatus(400);
        throw new Error("senderId, content, and senderType are required");
      }

      const message = await this.chatService.createMessage(createDto);

      this.setStatus(201);
      return {
        success: true,
        message: "Message created successfully",
        data: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else if (error instanceof Error && error.message.includes("required")) {
        this.setStatus(400);
      } else if (
        error instanceof Error &&
        error.message === "Message content cannot be empty"
      ) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Get messages from a session
   * @summary Get session messages
   * @param sessionId Session ID
   * @param limit Number of messages per page (default: 50)
   * @param offset Number of messages to skip (default: 0)
   * @param orderBy Sort order: asc or desc (default: asc)
   * @returns List of messages
   */
  @Get("sessions/{sessionId}/messages")
  @SuccessResponse("200", "Messages retrieved successfully")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getSessionMessages(
    @Path() sessionId: string,
    @Query() limit?: number,
    @Query() offset?: number,
    @Query() orderBy?: "asc" | "desc"
  ): Promise<
    ApiResponse<{
      messages: MessageResponse[];
      total: number;
    }>
  > {
    try {
      const query: GetSessionMessagesDto = {
        limit: limit || 50,
        offset: offset || 0,
        orderBy: orderBy || "asc",
      };

      const result = await this.chatService.getSessionMessages(
        sessionId,
        query
      );

      return {
        success: true,
        message: "Messages retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Get message by ID
   * @summary Get message details
   * @param messageId Message ID
   * @returns Message details
   */
  @Get("messages/{messageId}")
  @SuccessResponse("200", "Message retrieved successfully")
  @Response<ErrorResponse>("404", "Message not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getMessageById(
    @Path() messageId: string
  ): Promise<ApiResponse<MessageResponse>> {
    try {
      const message = await this.chatService.getMessageById(messageId);

      return {
        success: true,
        message: "Message retrieved successfully",
        data: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Message not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Update message
   * @summary Update message
   * @param messageId Message ID
   * @param updateDto Message update details
   * @returns Updated message
   */
  @Put("messages/{messageId}")
  @SuccessResponse("200", "Message updated successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("404", "Message not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async updateMessage(
    @Path() messageId: string,
    @Body() updateDto: UpdateMessageDto
  ): Promise<ApiResponse<MessageResponse>> {
    try {
      if (!updateDto.content && !updateDto.metadata) {
        this.setStatus(400);
        throw new Error("At least one field (content or metadata) is required");
      }

      const message = await this.chatService.updateMessage(
        messageId,
        updateDto
      );

      return {
        success: true,
        message: "Message updated successfully",
        data: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Message not found") {
        this.setStatus(404);
      } else if (
        error instanceof Error &&
        error.message === "Message content cannot be empty"
      ) {
        this.setStatus(400);
      } else if (error instanceof Error && error.message.includes("required")) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Delete message
   * @summary Delete message
   * @param messageId Message ID
   * @returns Success message
   */
  @Delete("messages/{messageId}")
  @SuccessResponse("200", "Message deleted successfully")
  @Response<ErrorResponse>("404", "Message not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async deleteMessage(
    @Path() messageId: string
  ): Promise<ApiResponse<void>> {
    try {
      await this.chatService.deleteMessage(messageId);

      return {
        success: true,
        message: "Message deleted successfully",
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Message not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Search messages in a session
   * @summary Search messages
   * @param sessionId Session ID
   * @param searchTerm Search term
   * @param limit Maximum results (default: 50)
   * @returns Search results
   */
  @Get("sessions/{sessionId}/messages/search")
  @SuccessResponse("200", "Messages searched successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async searchMessages(
    @Path() sessionId: string,
    @Query() searchTerm?: string,
    @Query() limit?: number
  ): Promise<ApiResponse<MessageResponse[]>> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        this.setStatus(400);
        throw new Error("Search term is required");
      }

      const results = await this.chatService.searchMessages(
        sessionId,
        searchTerm,
        limit || 50
      );

      return {
        success: true,
        message: "Messages searched successfully",
        data: results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else if (error instanceof Error && error.message.includes("required")) {
        this.setStatus(400);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }

  /**
   * Clear all messages in a session
   * @summary Clear session messages
   * @param sessionId Session ID
   * @returns Success message
   */
  @Delete("sessions/{sessionId}/messages")
  @SuccessResponse("200", "Messages cleared successfully")
  @Response<ErrorResponse>("404", "Session not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async clearSessionMessages(
    @Path() sessionId: string
  ): Promise<ApiResponse<void>> {
    try {
      await this.chatService.clearSessionMessages(sessionId);

      return {
        success: true,
        message: "Messages cleared successfully",
        data: undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }
}
