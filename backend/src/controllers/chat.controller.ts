import {
  Body,
  Controller,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Security,
  Request,
} from "tsoa";
import { ChatService } from "../services/chat.service";
import { ProcessMessageInput } from "../services/langgraph.service";
import { ResponseHelper } from "../helpers/response.helper";
import { ApiResponse } from "../types/api-response.types";

/**
 * Request DTO for chat message processing
 * Handles both new conversations and interrupt resumptions
 */
interface ChatMessageDto {
  // For new conversations
  message?: string;
  userName?: string;
  workspaceId?: string;

  // For resuming interrupted workflows
  threadId?: string;
  response?: string | boolean;

  // Additional context
  blocked?: boolean;
  simulateConflict?: boolean;
}

/**
 * ChatController
 * Unified endpoint for all chat operations
 * Minimal logic - delegates to ChatService
 */
@Route("api/chat")
@Tags("Chat")
export class ChatController extends Controller {
  private chatService = new ChatService();

  /**
   * Process a chat message (new or resume)
   * @summary Unified chat endpoint for all workflows
   * @example requestBody {
   *   "message": "Create a meeting tomorrow at 2pm",
   *   "userName": "John Doe",
   *   "workspaceId": "workspace-123"
   * }
   * @example resumeRequestBody {
   *   "threadId": "thread-1234567890-abc123def",
   *   "response": "Tomorrow at 2pm to 3pm"
   * }
   */
  @Post("message")
  @Security("jwt")
  @SuccessResponse("200", "Message processed successfully")
  public async processMessage(
    @Body() requestBody: ChatMessageDto,
    @Request() req: Express.Request & { user?: { id: string } }
  ): Promise<
    ApiResponse<{
      threadId: string;
      status: string;
      message: string | null;
      intent?: string;
      currentWorkflow?: string;
      interrupt?: {
        type: "collect_info" | "confirm" | "conflict_resolution";
        payload: unknown;
      };
      missingFields?: string[];
      suggestedResponses?: string[];
      data?: unknown;
      error?: string;
    }>
  > {
    try {
      // Build input for service
      const input: ProcessMessageInput = {
        message: requestBody.message,
        userName: requestBody.userName,
        userId: req.user?.id,
        workspaceId: requestBody.workspaceId,
        threadId: requestBody.threadId,
        response: requestBody.response,
        blocked: requestBody.blocked,
        simulateConflict: requestBody.simulateConflict,
      };

      // Call service (validation + delegation)
      const result = await this.chatService.processMessage(input);

      // Format response
      return ResponseHelper.formatApiResponse(
        result,
        requestBody.threadId ? "Response processed" : "Message processed"
      );
    } catch (error) {
      console.error("Error processing message:", error);
      this.setStatus(500);
      throw error instanceof Error
        ? error
        : new Error("Failed to process message");
    }
  }

  /**
   * Get current status of a chat session
   * @summary Check conversation state
   */
  @Post("status")
  @Security("jwt")
  @SuccessResponse("200", "Status retrieved successfully")
  public async getChatStatus(
    @Body() requestBody: { threadId: string }
  ): Promise<
    ApiResponse<{
      threadId: string;
      status: string;
      message: string | null;
      intent?: string;
      currentWorkflow?: string;
      interrupt?: {
        type: "collect_info" | "confirm" | "conflict_resolution";
        payload: unknown;
      };
      missingFields?: string[];
      suggestedResponses?: string[];
      data?: unknown;
      error?: string;
    } | null>
  > {
    try {
      const result = await this.chatService.getChatStatus(
        requestBody.threadId
      );

      if (!result) {
        this.setStatus(404);
        return ResponseHelper.formatCustomResponse(
          false,
          "Chat session not found",
          null
        );
      }

      return ResponseHelper.formatApiResponse(
        result,
        "Status retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting chat status:", error);
      this.setStatus(500);
      throw error instanceof Error
        ? error
        : new Error("Failed to get chat status");
    }
  }
}
