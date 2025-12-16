/**
 * Evaluation Service using official agentevals package
 * https://docs.langchain.com/oss/javascript/langchain/evals
 *
 * Uses prebuilt LLM-as-Judge evaluators from agentevals:
 * - createTrajectoryLLMAsJudge: LLM evaluates trajectory accuracy
 * - Batch evaluation with aggregate statistics
 * - Reference templates for operation-specific evaluation context
 */

import { PromptService } from "./prompt.service";
import { AIPrompt, PromptType } from "../entities/ai-prompt.entity";
import {
  HumanMessage,
  AIMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { SenderType } from "../enums/role.enum";
import {
  createTrajectoryLLMAsJudge,
  TRAJECTORY_ACCURACY_PROMPT,
} from "agentevals";
import {
  detectOperation,
  getAllCriticalRules,
  getEvaluationContext,
  EVALUATION_REFERENCE,
} from "../prompts/evaluation-reference";

/**
 * agentevals evaluation result
 * Follows standard evaluator pattern: {key, score, comment}
 */
export interface TrajectoryEvaluationResult {
  key: string;
  score: boolean | number;
  comment?: string;
}

/**
 * Single session evaluation using agentevals
 */
export interface SessionEvaluationResult {
  trajectoryAccuracy: TrajectoryEvaluationResult;
  overallScore: number; // 0-10 based on evaluator result
  evaluatedAt: Date;
}

/**
 * Batch evaluation statistics
 */
export interface BatchEvaluationStats {
  totalSessions: number;
  accuracyRate: number; // % of sessions with accurate trajectory
  overallScore: number; // Average score across sessions
  passRate: number; // % of sessions with score >= 7
  evaluatedSessions: number;
  timestamp: Date;
}

/**
 * Evaluation Service using official agentevals package
 *
 * Key features:
 * - Uses createTrajectoryLLMAsJudge from agentevals
 * - LLM-as-Judge evaluation of message trajectories
 * - Batch processing with aggregate statistics
 * - Automatic prompt optimization based on accuracy
 */
export class EvaluationService {
  private generationModel: ChatOpenAI;
  private trajectoryEvaluator: any;

  constructor(
    _langchainService: any, // Kept for queue compatibility
    private promptService: PromptService
  ) {
    // Model for generating optimized prompts
    this.generationModel = new ChatOpenAI({
      model: "gpt-4o-mini",
      maxTokens: 2048,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize agentevals trajectory evaluator
    // Uses LLM-as-Judge to evaluate message conversation accuracy
    // Model format: "provider:model-name" as per agentevals docs
    this.trajectoryEvaluator = createTrajectoryLLMAsJudge({
      model: "openai:gpt-4o-mini",
      prompt: TRAJECTORY_ACCURACY_PROMPT,
    });
  }

  /**
   * Evaluate a batch of sessions using agentevals trajectory evaluator
   * Only batch evaluation - no per-session public API
   */
  public async evaluateBatch(
    sessions: any[],
    currentPrompt: AIPrompt
  ): Promise<BatchEvaluationStats | null> {
    if (!sessions || sessions.length === 0) return null;

    console.log(
      `[Evaluation] Starting batch evaluation of ${sessions.length} sessions using agentevals`
    );

    const evaluationResults: SessionEvaluationResult[] = [];

    // Evaluate each session using agentevals trajectory evaluator
    for (const session of sessions) {
      const messages = session.messages || [];
      if (messages.length < 2) continue;

      try {
        const baseMessages = this.convertToBaseMessages(messages);
        const result = await this.evaluateSessionWithAgentevals(baseMessages);
        evaluationResults.push(result);
      } catch (error) {
        console.error(`Failed to evaluate session ${session.id}:`, error);
      }
    }

    if (evaluationResults.length === 0) {
      console.log("[Evaluation] No valid sessions to evaluate");
      return null;
    }

    // Compute batch statistics
    const stats = this.computeBatchStatistics(evaluationResults);
    console.log(`[Evaluation] Batch statistics:`, stats);

    // Update prompt with evaluation results
    await this.promptService.updatePromptEvaluation(currentPrompt.id, {
      evaluationMethod: "agentevals_trajectory_llm_as_judge",
      batchSize: evaluationResults.length,
      timestamp: new Date().toISOString(),
      metrics: stats,
    });

    // Generate optimized prompt if accuracy is below threshold
    if (stats.passRate < 0.7) {
      console.log(
        `[Evaluation] Pass rate ${(stats.passRate * 100).toFixed(
          1
        )}% < 70%. Optimizing prompt...`
      );

      const newPromptText = await this.generateOptimizedPrompt(
        currentPrompt.promptText,
        stats
      );

      if (newPromptText && newPromptText !== currentPrompt.promptText) {
        await this.promptService.saveNewPrompt(
          newPromptText,
          PromptType.SYSTEM,
          "BATCH-" + new Date().getTime(),
          currentPrompt.id,
          {
            originReason:
              "Automated optimization via agentevals trajectory evaluation",
            batchStats: stats,
          }
        );
        console.log("[Evaluation] ✅ New optimized prompt saved!");
      }
    } else {
      console.log(
        `[Evaluation] Accuracy ${(stats.accuracyRate * 100).toFixed(
          1
        )}% >= 70%. No optimization needed.`
      );
    }

    return stats;
  }

  /**
   * Evaluate a single session using agentevals trajectory evaluator
   * Private method - only used internally by evaluateBatch
   *
   * Now includes reference template context for operation-specific evaluation
   */
  private async evaluateSessionWithAgentevals(
    messages: BaseMessage[]
  ): Promise<SessionEvaluationResult> {
    try {
      // Convert BaseMessages to conversation format expected by agentevals
      // Using instanceof check (not deprecated like _getType() or isHumanMessage())
      const conversationOutputs = messages.map((msg) => ({
        role: msg instanceof HumanMessage ? "user" : "assistant",
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      }));

      // Detect operation type from conversation to get specific evaluation context
      const conversationText = conversationOutputs
        .map((m) => m.content)
        .join(" ");
      const detectedOperation = detectOperation(conversationText);

      // Use agentevals trajectory evaluator to assess conversation quality
      // The evaluator scores based on the trajectory (conversation flow quality)
      const evaluation = await this.trajectoryEvaluator({
        outputs: conversationOutputs,
      });

      // Convert evaluator score to 0-10 scale
      // agentevals returns boolean or numeric score
      const scoreValue =
        typeof evaluation.score === "boolean"
          ? evaluation.score
            ? 10
            : 0
          : Math.max(0, Math.min(10, evaluation.score));

      // Log evaluation details for monitoring
      if (detectedOperation) {
        console.log(
          `[Evaluation] Session evaluated as ${detectedOperation}: score ${scoreValue}/10`
        );
      }

      return {
        trajectoryAccuracy: evaluation,
        overallScore: scoreValue,
        evaluatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to evaluate session with agentevals:", error);
      return {
        trajectoryAccuracy: {
          key: "trajectory_accuracy",
          score: 0,
          comment: "Evaluation failed",
        },
        overallScore: 0,
        evaluatedAt: new Date(),
      };
    }
  }

  /**
   * Compute batch statistics from evaluation results
   */
  private computeBatchStatistics(
    results: SessionEvaluationResult[]
  ): BatchEvaluationStats {
    const totalSessions = results.length;

    // Calculate average overall score
    const totalScore = results.reduce((sum, r) => sum + r.overallScore, 0);
    const overallScore = totalScore / totalSessions;

    // Calculate accuracy rate (% of accurate trajectories)
    // accuracy = sessions with score >= 7
    const accurateCount = results.filter((r) => r.overallScore >= 7).length;
    const accuracyRate = accurateCount / totalSessions;

    // Pass rate is same as accuracy rate for agentevals
    const passRate = accuracyRate;

    return {
      totalSessions,
      accuracyRate,
      overallScore: Math.round(overallScore * 10) / 10,
      passRate,
      evaluatedSessions: totalSessions,
      timestamp: new Date(),
    };
  }

  /**
   * Generate optimized prompt based on evaluation results
   * Uses structured evaluation reference templates for proper guidance
   */
  private async generateOptimizedPrompt(
    currentPromptText: string,
    stats: BatchEvaluationStats
  ): Promise<string> {
    // Get comprehensive reference context using structured evaluation templates
    const criticalRules = getAllCriticalRules();

    // Build detailed reference context from ALL operation templates
    const allOperationContexts = Object.keys(EVALUATION_REFERENCE).map((key) => {
      return getEvaluationContext(EVALUATION_REFERENCE[key as keyof typeof EVALUATION_REFERENCE].name);
    }).join("\n\n---\n\n");

    const referenceContext = `
COMPLETE EVALUATION REFERENCE TEMPLATES:
${allOperationContexts}

CRITICAL RULES ACROSS ALL OPERATIONS (Must Follow All):
${criticalRules.map((rule: string) => `- ${rule}`).join("\n")}
`;

    const optimizationPrompt = `You are an expert Prompt Engineer specializing in conversational AI systems.

COMPLETE REFERENCE EVALUATION TEMPLATES & CRITICAL RULES:
${referenceContext}

CURRENT SYSTEM PROMPT:
"${currentPromptText}"

EVALUATION RESULTS:
- Trajectory Accuracy: ${(stats.accuracyRate * 100).toFixed(1)}%
- Overall Score: ${stats.overallScore}/10
- Total Sessions Evaluated: ${stats.evaluatedSessions}

ANALYSIS:
The current prompt resulted in ${((1 - stats.accuracyRate) * 100).toFixed(1)}% failure rate.
This indicates the agent is NOT consistently following the expected conversation patterns defined in the evaluation reference templates.

Common failures include:
- Not asking for all required fields in ONE consolidated message
- Missing confirmations before execution (CRITICAL violation)
- Not showing available workspaces explicitly
- Not handling partial information correctly
- Improper location geocoding (geocoding vague locations like "work")
- Asking for workspace multiple times
- Not following the exact phase sequence defined in templates
- Not using the expected response formats

TASK:
DO NOT simply copy or slightly modify the old prompt. Instead, completely REWRITE the system prompt to strictly adhere to ALL phases and patterns defined in the reference evaluation templates above.

The new prompt MUST:
1. Explicitly follow the phase-by-phase flow for each operation (CREATE, UPDATE, DELETE, READ)
2. Include the exact "mustHave" requirements and avoid all "mustNotHave" violations
3. Use the responseFormat templates provided in the reference for consistency
4. Enforce ALL critical rules across operations
5. Be structured with clear sections for each operation type
6. Include explicit instructions for conversation state tracking
7. Specify exact tool call sequences (e.g., get_user_workspaces before create_event)
8. Define timezone handling (GMT +7 display, UTC for tools)
9. Mandate confirmation steps before any destructive or state-changing actions

Structure the prompt with:
- Clear operation detection instructions
- Phase-by-phase conversation flow for each operation
- Expected response formats matching the reference templates
- Tool usage guidelines and sequences
- Critical rules enforcement

Return ONLY the new system prompt text. Do not include explanations, markdown formatting, or commentary.`;

    try {
      const response = await this.generationModel.invoke([
        new HumanMessage(optimizationPrompt),
      ]);
      return response.content.toString().trim();
    } catch (error) {
      console.error("Failed to generate optimized prompt:", error);
      return currentPromptText;
    }
  }

  /**
   * Helper: Convert database messages to LangChain BaseMessages
   */
  private convertToBaseMessages(messages: any[]): BaseMessage[] {
    return messages.map((m) => {
      if (m.senderType === SenderType.USER) {
        return new HumanMessage(m.content);
      } else {
        return new AIMessage(m.content);
      }
    });
  }
}
