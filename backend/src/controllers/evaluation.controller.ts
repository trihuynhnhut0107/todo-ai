import {
  Controller,
  Post,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
import { AppDataSource } from "../data-source";
import { EvaluationService } from "../services/evaluation.service";
import { PromptService } from "../services/prompt.service";
import { LangchainService } from "../services/langchain.service";
import { Session } from "../entities/session.entity";
import { PromptType } from "../entities/ai-prompt.entity";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";
import { BatchEvaluationStats } from "../services/evaluation.service";

@Route("evaluation")
@Tags("Evaluation")
export class EvaluationController extends Controller {
  /**
   * Manually trigger batch evaluation of all sessions using current prompt
   * @summary Trigger manual evaluation
   * @returns Batch evaluation results
   */
  @Post("trigger")
  @SuccessResponse("200", "Evaluation triggered successfully")
  @Response<ErrorResponse>("400", "No sessions to evaluate")
  @Response<ErrorResponse>("500", "Evaluation failed")
  public async triggerEvaluation(): Promise<ApiResponse<BatchEvaluationStats>> {
    try {
      const langchainService = new LangchainService();
      const promptService = new PromptService();
      const evaluationService = new EvaluationService(
        langchainService,
        promptService
      );
      const sessionRepository = AppDataSource.getRepository(Session);

      // 1. Get the latest system prompt
      const latestPrompt = await promptService.getLatestPrompt(
        PromptType.SYSTEM
      );

      if (!latestPrompt) {
        this.setStatus(400);
        throw new Error("No system prompt found");
      }

      // 2. Find ALL sessions that used this specific prompt version
      const allSessionsWithPrompt = await sessionRepository.find({
        where: {
          promptId: latestPrompt.id,
        },
        relations: ["messages"],
        order: {
          updatedAt: "DESC",
        },
      });

      if (allSessionsWithPrompt.length === 0) {
        this.setStatus(400);
        throw new Error("No sessions found using current prompt");
      }

      console.log(
        `[Manual Trigger] Evaluating ${allSessionsWithPrompt.length} sessions using current prompt...`
      );

      // 3. Trigger batch evaluation
      const stats = await evaluationService.evaluateBatch(
        allSessionsWithPrompt,
        latestPrompt
      );

      if (!stats) {
        this.setStatus(400);
        throw new Error("Evaluation returned no results");
      }

      console.log("[Manual Trigger] Batch evaluation completed successfully");

      return {
        success: true,
        message: `Evaluation completed for ${allSessionsWithPrompt.length} sessions`,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error triggering evaluation:", error);
      this.setStatus(500);
      throw error;
    }
  }
}
