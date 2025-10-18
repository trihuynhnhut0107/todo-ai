import { Request, Response } from "express";
import { LangchainService } from "../services/langchain.service";
import { BaseController } from "./base.controller";

interface GenerateResponseRequest {
  input: string;
}

interface GenerateResponseData {
  response: string;
  input: string;
}

class LangchainController extends BaseController {
  constructor(private langchainService: LangchainService) {
    super();
  }

  getResponse = this.asyncHandler(async (req: Request, res: Response) => {
    const { input }: GenerateResponseRequest = req.body;

    // Validate input
    if (!input || typeof input !== "string" || input.trim() === "") {
      return this.sendValidationError(
        res,
        "Input is required and must be a non-empty string"
      );
    }

    const botResponse = await this.langchainService.generateResponse(input);

    const responseData: GenerateResponseData = {
      response: botResponse,
      input: input.trim(),
    };

    return this.sendSuccess(
      res,
      responseData,
      "Response generated successfully"
    );
  });
}

export default LangchainController;
