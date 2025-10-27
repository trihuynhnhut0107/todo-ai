/**
 * Workflow Helper
 * Workflow-specific utilities for event creation and other workflows
 */

import { LangchainService } from "../services/langchain.service";
import { CreateEventInput } from "../schemas/event.schema";

export class WorkflowHelper {
  // ==========================================
  // EVENT CREATION HELPERS
  // ==========================================

  /**
   * Extract event data from user response using LLM
   */
  static async extractEventData(
    response: string
  ): Promise<Partial<CreateEventInput>> {
    const langchainService = new LangchainService();
    return langchainService.extractEventData(response);
  }

  /**
   * Merge existing and new event data
   */
  static mergeEventData(
    existing: Partial<CreateEventInput>,
    newData: Partial<CreateEventInput>
  ): Partial<CreateEventInput> {
    return {
      ...existing,
      ...newData,
    };
  }

  /**
   * Get missing required fields from event data
   */
  static getMissingFields(
    data: Partial<CreateEventInput>
  ): (keyof CreateEventInput)[] {
    const requiredFields: (keyof CreateEventInput)[] = ["name", "start", "end"];
    return requiredFields.filter((field) => !data[field]);
  }

  /**
   * Check if event data is complete
   */
  static isEventDataComplete(data: Partial<CreateEventInput>): boolean {
    return !!(data.name && data.start && data.end);
  }

  /**
   * Format event summary for user confirmation
   */
  static formatEventSummary(data: Partial<CreateEventInput>): string {
    return `
📅 Event Summary:
• Name: ${data.name || "N/A"}
• Start: ${data.start || "N/A"}
• End: ${data.end || "N/A"}
${data.description ? `• Description: ${data.description}` : ""}
${data.location ? `• Location: ${data.location}` : ""}
${data.tags?.length ? `• Tags: ${data.tags.join(", ")}` : ""}

Would you like to create this event?
    `.trim();
  }

  /**
   * Generate question for missing fields
   */
  static generateMissingFieldsQuestion(missingFields: string[]): string {
    const fieldLabels: Record<string, string> = {
      name: "event name/title",
      start: "start date and time",
      end: "end date and time",
      workspaceId: "workspace",
    };

    const missingLabels = missingFields
      .map((field) => fieldLabels[field] || field)
      .join(", ");

    return `I need some more information to create this event. Please provide: ${missingLabels}`;
  }

  // ==========================================
  // COMMON HELPERS
  // ==========================================

  /**
   * Parse user intent from response string
   */
  static parseUserIntent(response: string | boolean): "yes" | "no" | "other" {
    if (typeof response === "boolean") {
      return response ? "yes" : "no";
    }

    const lowerResponse = response.toLowerCase().trim();

    if (
      lowerResponse.includes("yes") ||
      lowerResponse.includes("create") ||
      lowerResponse.includes("confirm") ||
      lowerResponse.includes("sure") ||
      lowerResponse.includes("ok")
    ) {
      return "yes";
    }

    if (
      lowerResponse.includes("no") ||
      lowerResponse.includes("cancel") ||
      lowerResponse.includes("stop") ||
      lowerResponse.includes("don't")
    ) {
      return "no";
    }

    return "other";
  }

  /**
   * Get suggested responses based on type
   */
  static getSuggestedResponses(
    type: "field" | "confirm" | "conflict"
  ): string[] {
    switch (type) {
      case "field":
        return [
          "Tomorrow at 2pm to 3pm",
          "Next Monday 9am for 1 hour",
          "Friday afternoon",
        ];
      case "confirm":
        return ["Yes, create it", "No, cancel", "Let me modify it"];
      case "conflict":
        return [
          "Change time to 3pm",
          "Cancel this event",
          "Create anyway",
        ];
      default:
        return [];
    }
  }

  /**
   * Generate unique thread ID
   */
  static generateThreadId(): string {
    return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
