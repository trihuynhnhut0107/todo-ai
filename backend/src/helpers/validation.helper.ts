/**
 * Validation Helper
 * Input validation utilities for chat operations
 */

export interface ProcessMessageInput {
  // For new conversations
  message?: string;
  userName?: string;
  userId?: string;
  workspaceId?: string;

  // For resuming interrupted workflows
  threadId?: string;
  response?: string | boolean;

  // Additional context
  blocked?: boolean;
  simulateConflict?: boolean;
}

export class ValidationHelper {
  /**
   * Validate input for new message
   */
  static validateNewMessageInput(input: ProcessMessageInput): void {
    if (!input.message || typeof input.message !== "string") {
      throw new Error("message is required and must be a string for new conversations");
    }

    if (input.message.trim().length === 0) {
      throw new Error("message cannot be empty");
    }
  }

  /**
   * Validate input for resuming interrupted workflow
   */
  static validateResumeInput(input: ProcessMessageInput): void {
    if (!input.threadId || typeof input.threadId !== "string") {
      throw new Error("threadId is required and must be a string for resuming");
    }

    if (input.response === undefined || input.response === null) {
      throw new Error("response is required for resuming interrupted workflow");
    }
  }

  /**
   * Validate thread ID format
   */
  static validateThreadId(threadId: string): void {
    if (!threadId || typeof threadId !== "string") {
      throw new Error("Invalid threadId: must be a non-empty string");
    }

    if (!threadId.startsWith("thread-")) {
      throw new Error("Invalid threadId format: must start with 'thread-'");
    }
  }

  /**
   * Validate workspace ID
   */
  static validateWorkspaceId(workspaceId?: string): void {
    if (workspaceId && typeof workspaceId !== "string") {
      throw new Error("workspaceId must be a string");
    }
  }

  /**
   * Validate user ID
   */
  static validateUserId(userId?: string): void {
    if (userId && typeof userId !== "string") {
      throw new Error("userId must be a string");
    }
  }
}
