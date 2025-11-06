import { Body, Controller, Post, Route, SuccessResponse, Tags } from "tsoa";
import { LanggraphService } from "../services/langgraph.service";
import { LangchainService } from "../services/langchain.service";
import { ApiResponse } from "../types/api-response.types";

interface ProcessMessageDto {
  userName: string;
  messages: string[];
  blocked?: boolean;
}

interface ChatResponseDto {
  userName: string;
  intent: string;
  response: string;
  messages: string[];
}

@Route("api/chat")
@Tags("Chat")
export class ChatController extends Controller {
  private service = new LanggraphService(new LangchainService());

  /**
   * Process a chat message through the AI agent
   * @summary Process chat message
   * @example requestBody {
   *   "userName": "John Doe",
   *   "messages": ["Create a task for tomorrow: Review pull requests"],
   *   "blocked": false
   * }
   */
  @Post("message")
  @SuccessResponse("200", "Message processed successfully")
  public async processMessage(
    @Body() requestBody: ProcessMessageDto
  ): Promise<ApiResponse<ChatResponseDto>> {
    // Validate input
    if (!requestBody.userName || !requestBody.messages) {
      this.setStatus(400);
      throw new Error("userName and messages are required");
    }

    if (!Array.isArray(requestBody.messages)) {
      this.setStatus(400);
      throw new Error("messages must be an array");
    }

    if (requestBody.messages.length === 0) {
      this.setStatus(400);
      throw new Error("messages array cannot be empty");
    }

    // Call service
    const result = await this.service.processMessage({
      userName: requestBody.userName,
      messages: requestBody.messages,
      blocked: requestBody.blocked ?? false,
    });

    return {
      success: true,
      message: "Message processed successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
