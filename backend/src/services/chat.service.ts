import {
  LanggraphService,
  ProcessMessageInput,
  ProcessMessageOutput,
} from "./langgraph.service";
import { ValidationHelper } from "../helpers/validation.helper";

/**
 * ChatService
 * Thin facade over LanggraphService
 * Provides validation and delegates to master router
 */
export class ChatService {
  private langgraphService: LanggraphService;

  constructor() {
    this.langgraphService = new LanggraphService();
  }

  /**
   * Process a chat message (new or resume)
   * Handles both new conversations and interrupt resumptions
   */
  async processMessage(
    input: ProcessMessageInput
  ): Promise<ProcessMessageOutput> {
    // Validate based on whether it's new or resuming
    if (input.threadId) {
      ValidationHelper.validateResumeInput(input);
    } else {
      ValidationHelper.validateNewMessageInput(input);
    }

    // Delegate to master router (handles interrupts automatically)
    return this.langgraphService.processMessage(input);
  }

  /**
   * Get current status of a chat session
   */
  async getChatStatus(
    threadId: string
  ): Promise<ProcessMessageOutput | null> {
    ValidationHelper.validateThreadId(threadId);
    return this.langgraphService.getChatStatus(threadId);
  }
}
