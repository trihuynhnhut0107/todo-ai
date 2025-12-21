/**
 * LangSmith Evaluation Dataset for Agent Tool Calls
 *
 * Each example contains:
 * - input: User message to the agent
 * - expectedTools: Array of tool names that should be called
 * - description: Human-readable description for debugging
 */

export interface EvaluationExample {
  input: string;
  expectedTools: string[];
  description: string;
}

/**
 * Basic evaluation dataset covering core tool call scenarios
 */
export const agentEvaluationDataset: EvaluationExample[] = [
  // Event Creation
  {
    input: "Create a meeting called 'Team Standup' tomorrow at 10am",
    expectedTools: ["create_event"],
    description: "Basic event creation with name and time",
  },
  {
    input: "Schedule a doctor appointment for next Monday at 2pm",
    expectedTools: ["create_event"],
    description: "Event creation with relative date",
  },

  // Event Querying
  {
    input: "What events do I have this week?",
    expectedTools: ["get_events"],
    description: "Query events with date range filter",
  },
  {
    input: "Show me all my upcoming meetings",
    expectedTools: ["get_events"],
    description: "Query all future events",
  },

  // Event Deletion
  {
    input: "Delete the event with id xyz-456",
    expectedTools: ["delete_event"],
    description: "Delete specific event by ID",
  },

  // Workspace Operations
  {
    input: "Create a new workspace called 'Personal Projects'",
    expectedTools: ["create_workspace"],
    description: "Create new workspace",
  },
  {
    input: "Show me all my workspaces",
    expectedTools: ["get_user_workspaces"],
    description: "List user workspaces",
  },

  // Location/Mapbox Operations
  {
    input: "What are the coordinates for 'Empire State Building, New York'?",
    expectedTools: ["geocode_place"],
    description: "Geocode a place name to coordinates",
  },
  {
    input:
      "How long will it take to drive from '123 Main St, Boston' to 'Logan Airport'?",
    expectedTools: ["get_travel_time"],
    description: "Calculate travel time between locations",
  },
];

/**
 * Dataset name for LangSmith
 */
export const DATASET_NAME = "todo-agent-tool-calls-basic";

/**
 * Dataset description for LangSmith
 */
export const DATASET_DESCRIPTION =
  "Basic evaluation dataset for verifying correct tool calls by the todo-ai agent. Covers event CRUD, workspace operations, and location services.";
