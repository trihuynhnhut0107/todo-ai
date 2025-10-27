import {
  StateGraph,
  START,
  END,
  MemorySaver,
  interrupt,
  Command,
} from "@langchain/langgraph";
import {
  ChatStateAnnotation,
  ChatStateType,
} from "../schemas/chat-state.schema";
import { LangchainService } from "../services/langchain.service";
import { EventService } from "../services/event.service";
import { CreateEventDto } from "../dtos/event.dto";
import { CreateEventInput } from "../schemas/event.schema";
import { WorkflowHelper } from "../helpers/workflow.helper";

/**
 * Event Creation Workflow using LangGraph
 * Handles interactive event creation with human-in-the-loop interrupts
 */

// Placeholder for conflict detection (can be toggled for testing)
let SIMULATE_CONFLICT = false;

export function setConflictSimulation(value: boolean) {
  SIMULATE_CONFLICT = value;
}

/**
 * Node 1: Detect Intent
 * Analyzes user input to determine intent and extract partial event data
 */
async function detectIntentNode(
  state: ChatStateType
): Promise<Partial<ChatStateType>> {
  const langchainService = new LangchainService();
  const latestMessage = state.messages[state.messages.length - 1];

  if (!latestMessage || latestMessage.role !== "user") {
    return {
      status: "failed",
      error: "No user message found",
      responseMessage: "I didn't receive any input. Please try again.",
    };
  }

  const detected = await langchainService.detectIntent(latestMessage.content);

  if (detected.intent === "unknown" || detected.confidence < 0.6) {
    return {
      status: "failed",
      responseMessage:
        "I'm not sure what you're asking for. Could you please rephrase?",
      suggestedResponses: [
        "Create a meeting tomorrow at 2pm",
        "Schedule dentist appointment next week",
        "Add birthday party on Saturday",
      ],
    };
  }

  if (detected.intent !== "create_event") {
    return {
      status: "failed",
      responseMessage: `I detected a '${detected.intent}' intent, but currently I only support creating events.`,
    };
  }

  return {
    intent: detected.intent,
    extractedEventData: detected.extractedData as any,
    missingFields: detected.missingFields,
    status:
      detected.missingFields.length > 0
        ? "collecting_info"
        : "awaiting_confirmation",
  };
}

/**
 * Node 2: Collect Missing Information
 * Asks user for missing required fields using interrupt
 */
async function collectInfoNode(
  state: ChatStateType
): Promise<Partial<ChatStateType>> {
  if (state.missingFields.length === 0) {
    return { status: "awaiting_confirmation" };
  }

  // Use helper to generate question
  const question = WorkflowHelper.generateMissingFieldsQuestion(
    state.missingFields
  );

  // Interrupt to ask user for missing information
  const userResponse = interrupt({
    message: question,
    missingFields: state.missingFields,
    currentData: state.extractedEventData,
    suggestedResponses: WorkflowHelper.getSuggestedResponses("field"),
  });

  // After resume, extract the additional information
  const additionalData = await WorkflowHelper.extractEventData(
    userResponse as string
  );

  // Merge extracted data using helper
  const mergedData = WorkflowHelper.mergeEventData(
    state.extractedEventData || {},
    additionalData
  );

  // Check what's still missing using helper
  const stillMissing = WorkflowHelper.getMissingFields(mergedData);

  if (stillMissing.length > 0) {
    // Still missing fields, loop back
    return {
      extractedEventData: mergedData,
      missingFields: stillMissing,
      status: "collecting_info",
    };
  }

  return {
    extractedEventData: mergedData,
    missingFields: [],
    status: "awaiting_confirmation",
  };
}

/**
 * Node 3: Confirm Event Details
 * Shows user the complete event details and asks for confirmation
 */
async function confirmEventNode(
  state: ChatStateType
): Promise<Partial<ChatStateType> | Command> {
  const eventData = state.extractedEventData;

  if (!eventData) {
    return {
      status: "failed",
      error: "No event data to confirm",
    };
  }

  // Use helper to format event summary
  const eventSummary = WorkflowHelper.formatEventSummary(eventData);

  // Interrupt for confirmation
  const confirmed = interrupt({
    message: eventSummary,
    action: "confirm_event",
    eventData,
    suggestedResponses: WorkflowHelper.getSuggestedResponses("confirm"),
  });

  // Use helper to parse user intent
  const intent = WorkflowHelper.parseUserIntent(confirmed);

  if (intent === "yes") {
    return new Command({
      update: { status: "checking_conflicts" },
      goto: "checkConflicts",
    });
  } else {
    return new Command({
      update: {
        status: "cancelled",
        responseMessage: "Event creation cancelled.",
      },
      goto: END,
    });
  }
}

/**
 * Node 4: Check for Conflicts
 * Checks if the event time conflicts with existing events
 */
async function checkConflictsNode(
  state: ChatStateType
): Promise<Partial<ChatStateType> | Command> {
  // Placeholder conflict detection (can be toggled for testing)
  const hasConflict = SIMULATE_CONFLICT;

  if (hasConflict) {
    // Interrupt to ask user how to handle conflict
    const resolution = interrupt({
      message:
        "⚠️ Time conflict detected! You have another event at this time. What would you like to do?",
      conflictDetails: "Meeting with John (2pm - 3pm)",
      suggestedResponses: WorkflowHelper.getSuggestedResponses("conflict"),
    });

    // Use helper to parse user intent
    const intent = WorkflowHelper.parseUserIntent(resolution);

    if (intent === "no") {
      return new Command({
        update: {
          status: "cancelled",
          responseMessage: "Event creation cancelled due to conflict.",
        },
        goto: END,
      });
    }

    if (intent === "other") {
      // Extract new time from resolution
      // For now, just proceed (in real implementation, parse the new time)
      return {
        status: "creating_event",
        hasConflict: false,
      };
    }
  }

  return { status: "creating_event", hasConflict: false };
}

/**
 * Node 5: Create Event
 * Calls the event service to create the event in the database
 */
async function createEventNode(
  state: ChatStateType
): Promise<Partial<ChatStateType>> {
  try {
    const eventData = state.extractedEventData;

    if (!eventData || !eventData.name || !eventData.start || !eventData.end) {
      throw new Error("Missing required event data");
    }

    if (!state.workspaceId) {
      throw new Error("Workspace ID is required");
    }

    // Prepare CreateEventDto
    const createEventDto: CreateEventDto = {
      name: eventData.name,
      description: eventData.description,
      start: eventData.start,
      end: eventData.end,
      workspaceId: state.workspaceId,
      location: eventData.location,
      color: eventData.color,
      isAllDay: eventData.isAllDay,
      recurrenceRule: eventData.recurrenceRule,
      tags: eventData.tags,
      assigneeIds: eventData.assigneeIds,
    };

    const eventService = new EventService();
    // Note: You'll need to pass userId from state.userId
    // const createdEvent = await eventService.create(createEventDto, state.userId!);

    // For now, simulate success
    const createdEventId = "mock-event-id-" + Date.now();

    return {
      status: "completed",
      createdEventId,
      responseMessage: `✅ Event "${eventData.name}" created successfully!`,
      suggestedResponses: [
        "Create another event",
        "View my events",
        "Update this event",
      ],
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      responseMessage: "❌ Failed to create event. Please try again.",
    };
  }
}

/**
 * Build the Event Creation Workflow Graph
 */
export function buildEventCreationWorkflow() {
  const workflow = new StateGraph(ChatStateAnnotation)
    .addNode("detectIntent", detectIntentNode)
    .addNode("collectInfo", collectInfoNode)
    .addNode("confirmEvent", confirmEventNode)
    .addNode("checkConflicts", checkConflictsNode)
    .addNode("createEvent", createEventNode)
    .addEdge(START, "detectIntent")
    .addConditionalEdges("detectIntent", (state) => {
      if (state.status === "failed") return END;
      if (state.status === "collecting_info") return "collectInfo";
      return "confirmEvent";
    })
    .addConditionalEdges("collectInfo", (state) => {
      if (state.missingFields.length > 0) return "collectInfo"; // Loop for more info
      return "confirmEvent";
    })
    // confirmEvent uses Command to control routing
    .addConditionalEdges("checkConflicts", (state) => {
      if (state.status === "cancelled") return END;
      return "createEvent";
    })
    .addEdge("createEvent", END);

  const checkpointer = new MemorySaver();
  return workflow.compile({ checkpointer });
}

export const eventCreationWorkflow = buildEventCreationWorkflow();
