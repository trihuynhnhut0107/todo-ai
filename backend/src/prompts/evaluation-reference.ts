/**
 * Evaluation Reference Template
 *
 * This file defines the expected conversation patterns and response templates
 * that the evaluation system uses to assess agent quality.
 * Used by evaluation.service.ts to judge if agent responses follow the expected flow.
 */

export interface EvaluationCriteria {
  operation: string;
  phase: string;
  description: string;
  mustHave: string[];
  mustNotHave: string[];
  responseFormat?: string;
}

export interface OperationTemplate {
  name: string;
  keywords: string[];
  phases: EvaluationCriteria[];
  criticalRules: string[];
}

// Type for EVALUATION_REFERENCE
export type EvaluationReferenceType = Record<
  string,
  {
    name: string;
    keywords: string[];
    phases: Array<{
      operation: string;
      phase: string;
      description: string;
      mustHave: string[];
      mustNotHave: string[];
      responseFormat?: string;
    }>;
    criticalRules: string[];
  }
>;

export const EVALUATION_REFERENCE = {
  // ==================== CREATE EVENT ====================
  CREATE_EVENT: {
    name: "CREATE_EVENT",
    keywords: ["create", "add", "schedule", "new event", "make event"],
    phases: [
      {
        operation: "CREATE",
        phase: "1_ANALYZE_REQUEST",
        description: "Agent recognizes create request and extracts provided info",
        mustHave: [
          "Acknowledges user wants to create event",
          "Identifies which info is provided",
          "Identifies which info is missing",
        ],
        mustNotHave: [
          "Executing tool before asking for info",
          "Asking for fields piecemeal",
        ],
      },
      {
        operation: "CREATE",
        phase: "2_ASK_REQUIRED_FIELDS",
        description: "Agent asks for ALL required fields in ONE message",
        mustHave: [
          "Lists required fields: Name, Workspace, Description, Start time, End time",
          "Lists optional fields: Location, Repeat preference",
          "Shows available workspaces explicitly (calls get_user_workspaces)",
          "Asks all missing info in ONE consolidated message",
          "Clearly marks required vs optional fields",
        ],
        mustNotHave: [
          "Asking for workspace twice",
          "Asking fields in multiple separate messages",
          "Asking for complete fields again",
          "Not listing available workspaces",
        ],
        responseFormat: `Sure, I can create that event. Can you confirm these following details?

Required information:
- Name of the event: [extracted or "Please provide"]
- Workspace: I have found several workspaces like: [LIST AVAILABLE WORKSPACES]
- Description: [extracted or "Please provide"]
- Start time and date: [extracted or "Please provide"]
- End time and date: [extracted or "Please provide"]

Optional information:
- Location: [if you have a specific location]
- Repeat preference: daily, weekly, weekdays only, etc.

Please provide any missing information.`,
      },
      {
        operation: "CREATE",
        phase: "3_HANDLE_RESPONSE_PARTIAL",
        description: "If user provides partial info: show state + ask only for missing",
        mustHave: [
          "Shows current state: what's filled vs what's missing",
          "Lists only missing fields",
          "Maintains accuracy of provided data",
          "Doesn't ask workspace twice",
        ],
        mustNotHave: [
          "Re-asking already provided fields",
          "Asking for workspace again",
          "Asking all fields again",
        ],
        responseFormat: `Thank you! Here's what I have so far:
- Name of the event: [filled value]
- Workspace: [filled value]
- Description: Missing
- Start time and date: [filled value]
- End time and date: Missing
- Location: [if provided, or "Not specified"]
- Repeat preference: [if provided, or "Not specified"]

I still need: Description, End time and date. Please provide these.`,
      },
      {
        operation: "CREATE",
        phase: "3_HANDLE_RESPONSE_COMPLETE",
        description: "If user provides all info: prepare for verification",
        mustHave: [
          "Gathers all details from conversation history",
          "Only geocodes REAL location names (not 'work', 'meeting', 'home')",
          "Stores both address AND coordinates if geocoded",
          "Proceeds to verification without asking more questions",
        ],
        mustNotHave: [
          "Geocoding vague locations like 'work', 'meeting', 'home'",
          "Asking for missing fields again",
          "Re-geocoding already geocoded locations",
        ],
      },
      {
        operation: "CREATE",
        phase: "4_VERIFICATION",
        description: "Agent shows all details and asks for explicit confirmation",
        mustHave: [
          "Shows: Title, When (GMT +7), Workspace, Description, Location (if set), Repeat",
          "Times shown in GMT +7 format",
          "All details in clear bulleted list",
          "Explicit Yes/No confirmation requested",
          "Message says 'Please confirm if this information is correct, then I will proceed'",
        ],
        mustNotHave: [
          "Showing UTC times (must be GMT +7)",
          "Implicit confirmation (must be explicit)",
          "Unclear format",
        ],
        responseFormat: `Perfect! Here's your event:
- Title: [name]
- When: [GMT +7 start time] to [GMT +7 end time]
- Workspace: [workspace name]
- Description: [description]
- Location: [verified address or "Not set"]
- Repeat: [RRULE or 'None']

Please confirm if this information is correct, then I will proceed to create this event.
(Yes/No)`,
      },
      {
        operation: "CREATE",
        phase: "5_EXECUTE",
        description: "After confirmation, execute tools in correct sequence",
        mustHave: [
          "Executes tools only after Yes confirmation (non-negotiable)",
          "Tool Sequence (MUST be in this order):",
          "  1. Calls get_user_workspaces to get current workspace IDs",
          "  2. Matches workspace NAME to correct workspace ID",
          "  3. If location provided: calls mapbox tool (geocode_place)",
          "  4. Stores both address AND coordinates from mapbox",
          "  5. Converts all times from GMT +7 to UTC (subtract 7 hours)",
          "  6. Calls create_event with workspace_id, location, times, other details",
          "Reports success with event details from tool response",
        ],
        mustNotHave: [
          "Executing without confirmation",
          "Calling create_event before get_user_workspaces",
          "Using wrong workspace ID",
          "Geocoding vague locations like 'work', 'meeting', 'home'",
          "Incorrect timezone conversion (must be GMT +7 to UTC)",
          "Missing mapbox call when location is provided",
          "Storing location without coordinates",
        ],
      },
      {
        operation: "CREATE",
        phase: "5_HANDLE_CORRECTION",
        description: "If user wants to fix something, return to Phase 3",
        mustHave: [
          "Asks what needs to be fixed",
          "Returns to Phase 3 to gather corrected info",
          "Shows updated summary before re-confirming",
        ],
        mustNotHave: [
          "Asking all fields again",
          "Skipping verification step",
        ],
      },
    ],
    criticalRules: [
      "MUST ask all missing info in ONE message (Phase 2)",
      "MUST explicitly ask for confirmation before executing (Phase 4)",
      "MUST show available workspaces when workspace is needed",
      "MUST NOT ask for workspace twice",
      "MUST NOT geocode vague locations like 'work' or 'meeting'",
      "MUST show GMT +7 times to user (not UTC)",
      "MUST use conversation history to track provided data",
    ],
  },

  // ==================== UPDATE EVENT ====================
  UPDATE_EVENT: {
    name: "UPDATE_EVENT",
    keywords: ["update", "change", "modify", "reschedule", "move", "adjust"],
    phases: [
      {
        operation: "UPDATE",
        phase: "1_DETECT_REQUEST",
        description: "Agent recognizes update intent",
        mustHave: [
          "Recognizes update keywords",
          "Asks which event if not specified",
        ],
        mustNotHave: ["Executing without identifying event"],
      },
      {
        operation: "UPDATE",
        phase: "2_IDENTIFY_TARGET",
        description: "Agent finds correct event and confirms",
        mustHave: [
          "Uses get_events to search if needed",
          "Shows event details",
          "Asks for confirmation of target event",
        ],
        mustNotHave: ["Assuming wrong event"],
      },
      {
        operation: "UPDATE",
        phase: "3_ASK_WHAT_TO_CHANGE",
        description: "Agent shows current values and asks what to change",
        mustHave: [
          "Shows current values for all fields",
          "Clearly asks which fields to update",
          "Makes it easy for user to specify changes",
        ],
        mustNotHave: ["Not showing current values"],
        responseFormat: `I found the event: [event name] on [date/time]

What would you like to change?
- Name: [current value]
- Date and time: [current value]
- Location: [current value or 'Not set']
- Workspace: [current workspace]
- Description: [current value]
- Repeat preference: [current value or 'None']

Please provide the field(s) you want to update.`,
      },
      {
        operation: "UPDATE",
        phase: "4_HANDLE_CHANGES",
        description: "Agent processes field changes",
        mustHave: [
          "Correctly extracts changed field values",
          "Only geocodes real locations",
          "Converts times to GMT +7 for display",
          "Preserves unchanged fields",
        ],
        mustNotHave: ["Changing fields user didn't ask to change"],
      },
      {
        operation: "UPDATE",
        phase: "5_CONFIRMATION",
        description: "Shows changes and asks for confirmation",
        mustHave: [
          "Shows all updated details",
          "Indicates which fields changed",
          "Explicitly asks for confirmation",
        ],
        mustNotHave: ["Implicit confirmation"],
        responseFormat: `Updated event:
- Title: [name]
- When: [new GMT +7 time] to [new end time]
- Location: [new location if changed]
- Workspace: [workspace]
- Description: [description]

Confirm these changes? (Yes/No)`,
      },
      {
        operation: "UPDATE",
        phase: "6_EXECUTE",
        description: "Execute update after confirmation",
        mustHave: [
          "Executes update_event only after confirmation",
          "Uses correct parameters",
          "Shows success message",
        ],
        mustNotHave: ["Executing without confirmation"],
      },
    ],
    criticalRules: [
      "MUST show current values before asking for changes",
      "MUST ask for confirmation before executing",
      "MUST only change fields user specified",
      "MUST NOT geocode vague locations",
    ],
  },

  // ==================== DELETE EVENT ====================
  DELETE_EVENT: {
    name: "DELETE_EVENT",
    keywords: ["delete", "remove", "cancel", "discard", "drop"],
    phases: [
      {
        operation: "DELETE",
        phase: "1_DETECT_REQUEST",
        description: "Agent recognizes delete intent",
        mustHave: [
          "Recognizes delete keywords",
          "Asks which event if not specified",
        ],
        mustNotHave: ["Executing without identifying event"],
      },
      {
        operation: "DELETE",
        phase: "2_IDENTIFY_TARGET",
        description: "Agent finds and confirms correct event",
        mustHave: [
          "Identifies target event clearly",
          "Shows event details",
          "Asks for confirmation of target",
        ],
        mustNotHave: ["Assuming wrong event"],
      },
      {
        operation: "DELETE",
        phase: "3_CONFIRM_DELETION",
        description: "CRITICAL: Agent ALWAYS asks for deletion confirmation",
        mustHave: [
          "ALWAYS asks for confirmation (non-negotiable)",
          "Shows event details (Title, When, Workspace)",
          "Warns about irreversibility",
          "Uses clear Yes/No format",
        ],
        mustNotHave: [
          "Deleting without explicit confirmation",
          "Vague confirmation language",
        ],
        responseFormat: `Are you sure you want to delete this event?
- Title: [event name]
- When: [date/time]
- Workspace: [workspace]

This action cannot be undone. Confirm deletion? (Yes/No)`,
      },
      {
        operation: "DELETE",
        phase: "4_EXECUTE",
        description: "Execute only if user confirms with Yes",
        mustHave: [
          "Executes delete_event only after Yes",
          "Shows success message",
          "Respects No/cancellation",
        ],
        mustNotHave: ["Deleting without explicit Yes confirmation"],
      },
    ],
    criticalRules: [
      "MUST ALWAYS ask for explicit confirmation before deleting (non-negotiable)",
      "MUST show event details in confirmation",
      "MUST warn about irreversibility",
      "MUST use clear Yes/No format",
      "MUST respect user's No/cancellation",
    ],
  },

  // ==================== READ/VIEW EVENTS ====================
  READ_EVENT: {
    name: "READ_EVENT",
    keywords: ["show", "list", "display", "what's my", "schedule", "events on"],
    phases: [
      {
        operation: "READ",
        phase: "1_EXTRACT_REQUEST",
        description: "Agent extracts date/range from natural language",
        mustHave: [
          "Correctly parses date from user message (GMT +7)",
          "Identifies date range if requested",
          "Doesn't ask for clarification",
        ],
        mustNotHave: ["Asking user to clarify date"],
      },
      {
        operation: "READ",
        phase: "2_EXECUTE_QUERY",
        description: "Agent calls get_events with converted times",
        mustHave: [
          "Converts GMT +7 to UTC correctly",
          "Calls get_events with correct date range",
          "Handles no-results case",
        ],
        mustNotHave: ["Wrong timezone conversion"],
      },
      {
        operation: "READ",
        phase: "3_DISPLAY_RESULTS",
        description: "Agent displays all matching events clearly",
        mustHave: [
          "Shows all matching events",
          "Includes: event name, time, workspace",
          "Clear, readable format",
        ],
        mustNotHave: ["Hiding any matching events"],
      },
    ],
    criticalRules: [
      "NO confirmation needed for READ operations",
      "MUST convert GMT +7 to UTC correctly for queries",
      "MUST display all matching events",
    ],
  },
};

/**
 * Helper function to get evaluation context for a specific operation
 * Used by evaluation.service.ts to pass template context to agentevals
 */
export function getEvaluationContext(operation: string): string {
  const operationKey = Object.keys(EVALUATION_REFERENCE).find((k) =>
    EVALUATION_REFERENCE[k as keyof typeof EVALUATION_REFERENCE].name === operation
  );

  if (!operationKey) {
    return "";
  }

  const template = EVALUATION_REFERENCE[operationKey as keyof typeof EVALUATION_REFERENCE];

  let context = `# Evaluation Template for ${template.name}\n\n`;
  context += `**Operation Keywords:** ${template.keywords.join(", ")}\n\n`;

  context += `## Phases to Check:\n`;
  template.phases.forEach((phase: any) => {
    context += `\n### Phase: ${phase.phase}\n`;
    context += `**Description:** ${phase.description}\n`;
    context += `\n**Must Have:**\n`;
    phase.mustHave.forEach((item: string) => {
      context += `- ✅ ${item}\n`;
    });
    context += `\n**Must Not Have:**\n`;
    phase.mustNotHave.forEach((item: string) => {
      context += `- ❌ ${item}\n`;
    });
    if (phase.responseFormat) {
      context += `\n**Expected Response Format:**\n\`\`\`\n${phase.responseFormat}\n\`\`\`\n`;
    }
  });

  context += `\n## Critical Rules (Agent MUST follow all):\n`;
  template.criticalRules.forEach((rule) => {
    context += `- 🚨 ${rule}\n`;
  });

  return context;
}

/**
 * Helper function to get all critical rules across all operations
 */
export function getAllCriticalRules(): string[] {
  const rules: string[] = [];
  Object.values(EVALUATION_REFERENCE).forEach((template) => {
    rules.push(...template.criticalRules);
  });
  return rules;
}

/**
 * Helper function to check if a message contains operation keywords
 */
export function detectOperation(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const [_key, template] of Object.entries(EVALUATION_REFERENCE)) {
    const found = template.keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
    if (found) {
      return template.name;
    }
  }

  return null;
}

export default EVALUATION_REFERENCE;
