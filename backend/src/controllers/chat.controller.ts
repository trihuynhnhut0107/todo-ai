import { Request, Response } from "express";
import { LanggraphService } from "../services/langgraph.service";
import { BaseController } from "./base.controller";

export class ChatController extends BaseController {
  constructor(private service: LanggraphService) {
    super();
  }

  processMessage = this.asyncHandler(async (req: Request, res: Response) => {
    const { userName, messages, blocked } = req.body;

    // Validate input
    if (!userName || !messages || !Array.isArray(messages)) {
      return this.sendValidationError(
        res,
        "userName and messages (array) are required"
      );
    }

    if (messages.length === 0) {
      return this.sendValidationError(res, "messages array cannot be empty");
    }

    // Call service
    const result = await this.service.processMessage({
      userName,
      messages,
      blocked: blocked ?? false,
    });

    // Send success response using base controller method
    return this.sendSuccess(
      res,
      {
        userName: result.userName,
        intent: result.intent,
        response: result.response,
        messages: result.messages,
      },
      "Message processed successfully"
    );
  });
}
