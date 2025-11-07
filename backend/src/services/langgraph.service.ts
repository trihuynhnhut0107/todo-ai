import { Annotation, StateGraph } from "@langchain/langgraph";
import { LangchainService } from "./langchain.service";
import { IntentType } from "../enums/chat.enum";
import { Event } from "../types/event.types";
import { EventService } from "./event.service";

/**
 * Extended Event info with helper fields for lookups
 * Includes workspaceName and assigneeNames which are used to look up IDs
 */
export type ExtractedEventInfo = Partial<Event> & {
  workspaceName?: string;
  assigneeNames?: string[];
  eventName?: string; // For update/delete operations
};

// Graph state
const StateAnnotation = Annotation.Root({
  userId: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  messages: Annotation<string[]>({
    reducer: (left, right) => [...(left || []), ...(right || [])],
    default: () => [],
  }),
  intent: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  response: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  extractedInfo: Annotation<ExtractedEventInfo>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({}),
  }),
  confidence: Annotation<number>({
    reducer: (left, right) => right ?? left,
    default: () => 0,
  }),
  reasoning: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  requiredFieldsMissing: Annotation<string[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
  optionalFieldsMissing: Annotation<string[]>({
    reducer: (left, right) => Array.from(new Set([...(left || []), ...(right || [])])),
    default: () => [],
  }),
  // Validation state
  isValid: Annotation<boolean>({
    reducer: (left, right) => right ?? left,
    default: () => false,
  }),
  validationMessage: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
});

export type LanggraphState = typeof StateAnnotation.State;

export class LanggraphService {
  private compiledGraph: ReturnType<typeof this.buildGraph>;

  constructor(
    private langchainService: LangchainService,
    private eventService: EventService
  ) {
    this.compiledGraph = this.buildGraph();
  }

  // Node: Detect user intent
  private async detectIntentNode(state: LanggraphState) {
    const intentDetectionResult = await this.langchainService.detectIntent(
      state.messages
    );
    return {
      intent: intentDetectionResult.intent,
      extractedInfo: intentDetectionResult.extractedInfo,
      confidence: intentDetectionResult.confidence,
      reasoning: intentDetectionResult.reasoning,
      requiredFieldsMissing: intentDetectionResult.missingRequiredFields,
    };
  }

  private handleRoutingAfterIntentDetection(state: LanggraphState) {
    if (state.intent === IntentType.LIST_EVENTS) return "listEvent";
    if (state.intent === IntentType.CREATE_EVENT) return "validateCreateEvent";
    if (state.intent === IntentType.UPDATE_EVENT) return "validateUpdateEvent";
    if (state.intent === IntentType.DELETE_EVENT) return "validateDeleteEvent";
    if (state.intent === IntentType.OFF_TOPIC) return "handleOffTopic";
    return "handleGeneralChat";
  }

  // Validation node: Check if all required fields for CREATE are present
  private async validateCreateEventNode(state: LanggraphState) {
    const { extractedInfo } = state;
    const missing: string[] = [];

    // Required fields for creating an event
    if (!extractedInfo.name) missing.push("event name");
    if (!extractedInfo.start) missing.push("start time");
    if (!extractedInfo.end) missing.push("end time");
    if (!extractedInfo.workspaceId && !extractedInfo.workspaceName) {
      missing.push("workspace");
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        requiredFieldsMissing: missing,
        validationMessage: `To create an event, I need: ${missing.join(
          ", "
        )}. Please provide these details.`,
      };
    }

    return { isValid: true, requiredFieldsMissing: [] };
  }

  // Validation node: Check if all required fields for UPDATE are present
  private async validateUpdateEventNode(state: LanggraphState) {
    const { extractedInfo } = state;
    const missing: string[] = [];

    // For update, we need to identify the event first
    if (!extractedInfo.id && !extractedInfo.eventName) {
      missing.push("event name or ID to update");
    }

    // Check if there's at least one field to update
    const hasUpdateFields =
      extractedInfo.name ||
      extractedInfo.start ||
      extractedInfo.end ||
      extractedInfo.description ||
      extractedInfo.location ||
      extractedInfo.status ||
      extractedInfo.color !== undefined ||
      extractedInfo.isAllDay !== undefined;

    if (!hasUpdateFields) {
      missing.push("fields to update (e.g., new time, description, location)");
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        requiredFieldsMissing: missing,
        validationMessage: `To update an event, I need: ${missing.join(
          ", "
        )}. Please provide these details.`,
      };
    }

    return { isValid: true, requiredFieldsMissing: [] };
  }

  // Validation node: Check if all required fields for DELETE are present
  private async validateDeleteEventNode(state: LanggraphState) {
    const { extractedInfo } = state;
    const missing: string[] = [];

    // For delete, we need to identify the event
    if (!extractedInfo.id && !extractedInfo.eventName) {
      missing.push("event name or ID to delete");
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        requiredFieldsMissing: missing,
        validationMessage: `To delete an event, I need: ${missing.join(
          ", "
        )}. Please provide the event name or ID.`,
      };
    }

    return { isValid: true, requiredFieldsMissing: [] };
  }

  // Routing after validation: proceed or ask for info
  private routeAfterValidation(state: LanggraphState): string {
    return state.isValid ? "proceed" : "askForMissingInfo";
  }

  // Node: Ask user for missing information
  private async askForMissingInfoNode(state: LanggraphState) {
    return {
      response: state.validationMessage,
    };
  }

  // Node: Create event
  private async createEventNode(state: LanggraphState) {
    const { extractedInfo, userId } = state;

    try {
      // Resolve workspaceId from workspaceName if needed
      let workspaceId = extractedInfo.workspaceId;
      if (!workspaceId && extractedInfo.workspaceName) {
        // You would need a helper method to look up workspace by name
        // For now, we'll assume workspaceId is required from intent detection
        return {
          response: `Could not find workspace "${extractedInfo.workspaceName}". Please provide a valid workspace.`,
        };
      }

      // Commented out for testing - will be enabled later
      // const createDto = {
      //   name: extractedInfo.name!,
      //   start: extractedInfo.start!,
      //   end: extractedInfo.end!,
      //   workspaceId: workspaceId!,
      //   description: extractedInfo.description,
      //   location: extractedInfo.location,
      //   color: extractedInfo.color,
      //   isAllDay: extractedInfo.isAllDay,
      //   recurrenceRule: extractedInfo.recurrenceRule,
      //   tags: extractedInfo.tags,
      // };
      // const event = await this.eventService.createEvent(userId, createDto);

      // Mock response for testing
      return {
        response: `✅ [TEST MODE] Event "${extractedInfo.name}" would be created successfully!\n📅 Start: ${extractedInfo.start}\n📅 End: ${extractedInfo.end}\n👤 User: ${userId}`,
      };
    } catch (error: any) {
      return {
        response: `❌ Failed to create event: ${error.message}`,
      };
    }
  }

  // Node: Update event
  private async updateEventNode(state: LanggraphState) {
    const { extractedInfo, userId } = state;

    try {
      // Commented out for testing - will be enabled later
      // let eventId = extractedInfo.id;
      // if (!eventId && extractedInfo.eventName) {
      //   const events = await this.eventService.getEvents(userId, {
      //     workspaceId: extractedInfo.workspaceId,
      //   });
      //   const matchedEvent = events.find((e) =>
      //     e.name.toLowerCase().includes(extractedInfo.eventName!.toLowerCase())
      //   );
      //   if (!matchedEvent) {
      //     return {
      //       response: `❌ Event "${extractedInfo.eventName}" not found.`,
      //     };
      //   }
      //   eventId = matchedEvent.id;
      // }

      // Build update DTO with only changed fields
      const updateDto: any = {};
      if (extractedInfo.name) updateDto.name = extractedInfo.name;
      if (extractedInfo.start) updateDto.start = extractedInfo.start;
      if (extractedInfo.end) updateDto.end = extractedInfo.end;
      if (extractedInfo.description !== undefined)
        updateDto.description = extractedInfo.description;
      if (extractedInfo.location !== undefined)
        updateDto.location = extractedInfo.location;
      if (extractedInfo.status) updateDto.status = extractedInfo.status;
      if (extractedInfo.color) updateDto.color = extractedInfo.color;
      if (extractedInfo.isAllDay !== undefined)
        updateDto.isAllDay = extractedInfo.isAllDay;

      // const event = await this.eventService.updateEvent(eventId!, userId, updateDto);

      // Mock response for testing
      const eventIdentifier =
        extractedInfo.eventName || extractedInfo.id || "Unknown";
      return {
        response: `✅ [TEST MODE] Event "${eventIdentifier}" would be updated successfully!\nUpdates: ${JSON.stringify(
          updateDto,
          null,
          2
        )}\n👤 User: ${userId}`,
      };
    } catch (error: any) {
      return {
        response: `❌ Failed to update event: ${error.message}`,
      };
    }
  }

  // Node: Delete event
  private async deleteEventNode(state: LanggraphState) {
    const { extractedInfo, userId } = state;

    try {
      // Commented out for testing - will be enabled later
      // let eventId = extractedInfo.id;
      // let eventName = "";
      // if (!eventId && extractedInfo.eventName) {
      //   const events = await this.eventService.getEvents(userId, {
      //     workspaceId: extractedInfo.workspaceId,
      //   });
      //   const matchedEvent = events.find((e) =>
      //     e.name.toLowerCase().includes(extractedInfo.eventName!.toLowerCase())
      //   );
      //   if (!matchedEvent) {
      //     return {
      //       response: `❌ Event "${extractedInfo.eventName}" not found.`,
      //     };
      //   }
      //   eventId = matchedEvent.id;
      //   eventName = matchedEvent.name;
      // }
      // await this.eventService.deleteEvent(eventId!, userId);

      // Mock response for testing
      const eventIdentifier =
        extractedInfo.eventName || extractedInfo.id || "Unknown";
      return {
        response: `✅ [TEST MODE] Event "${eventIdentifier}" would be deleted successfully.\n👤 User: ${userId}`,
      };
    } catch (error: any) {
      return {
        response: `❌ Failed to delete event: ${error.message}`,
      };
    }
  }

  // Node: List events
  private async listEventNode(state: LanggraphState) {
    const { extractedInfo, userId } = state;

    try {
      // Commented out for testing - will be enabled later
      // const query: any = {};
      // if (extractedInfo.workspaceId) query.workspaceId = extractedInfo.workspaceId;
      // if (extractedInfo.start) query.startDate = extractedInfo.start;
      // if (extractedInfo.end) query.endDate = extractedInfo.end;
      // if (extractedInfo.status) query.status = extractedInfo.status;
      // const events = await this.eventService.getEvents(userId, query);

      // Mock response for testing
      const queryInfo = [];
      if (extractedInfo.workspaceId)
        queryInfo.push(`Workspace: ${extractedInfo.workspaceId}`);
      if (extractedInfo.start) queryInfo.push(`Start: ${extractedInfo.start}`);
      if (extractedInfo.end) queryInfo.push(`End: ${extractedInfo.end}`);
      if (extractedInfo.status)
        queryInfo.push(`Status: ${extractedInfo.status}`);

      return {
        response: `📋 [TEST MODE] Would list events with filters:\n${
          queryInfo.length > 0 ? queryInfo.join("\n") : "No filters"
        }\n👤 User: ${userId}`,
      };
    } catch (error: any) {
      return {
        response: `❌ Failed to list events: ${error.message}`,
      };
    }
  }

  // Node: Handle off-topic
  private async handleOffTopicNode(_state: LanggraphState) {
    return {
      response:
        "I'm designed to help with event management. Please ask about creating, updating, deleting, or listing events.",
    };
  }

  // Node: Handle general chat
  private async handleGeneralChatNode(state: LanggraphState) {
    const lastMessage = state.messages[state.messages.length - 1];
    const response = await this.langchainService.generateResponse(lastMessage);

    return { response };
  }

  // Build the workflow graph
  private buildGraph() {
    const graph = new StateGraph(StateAnnotation)
      // Add all nodes
      .addNode("detectIntent", this.detectIntentNode.bind(this))
      .addNode("validateCreateEvent", this.validateCreateEventNode.bind(this))
      .addNode("validateUpdateEvent", this.validateUpdateEventNode.bind(this))
      .addNode("validateDeleteEvent", this.validateDeleteEventNode.bind(this))
      .addNode("askForMissingInfo", this.askForMissingInfoNode.bind(this))
      .addNode("createEvent", this.createEventNode.bind(this))
      .addNode("updateEvent", this.updateEventNode.bind(this))
      .addNode("deleteEvent", this.deleteEventNode.bind(this))
      .addNode("listEvent", this.listEventNode.bind(this))
      .addNode("handleOffTopic", this.handleOffTopicNode.bind(this))
      .addNode("handleGeneralChat", this.handleGeneralChatNode.bind(this))

      // Start with intent detection
      .addEdge("__start__", "detectIntent")

      // Route based on detected intent
      .addConditionalEdges(
        "detectIntent",
        this.handleRoutingAfterIntentDetection.bind(this)
      )

      // Validation nodes route to either action or ask for info
      .addConditionalEdges(
        "validateCreateEvent",
        this.routeAfterValidation.bind(this),
        {
          proceed: "createEvent",
          askForMissingInfo: "askForMissingInfo",
        }
      )
      .addConditionalEdges(
        "validateUpdateEvent",
        this.routeAfterValidation.bind(this),
        {
          proceed: "updateEvent",
          askForMissingInfo: "askForMissingInfo",
        }
      )
      .addConditionalEdges(
        "validateDeleteEvent",
        this.routeAfterValidation.bind(this),
        {
          proceed: "deleteEvent",
          askForMissingInfo: "askForMissingInfo",
        }
      )

      // All terminal nodes end
      .addEdge("createEvent", "__end__")
      .addEdge("updateEvent", "__end__")
      .addEdge("deleteEvent", "__end__")
      .addEdge("listEvent", "__end__")
      .addEdge("askForMissingInfo", "__end__")
      .addEdge("handleOffTopic", "__end__")
      .addEdge("handleGeneralChat", "__end__");

    return graph.compile();
  }

  // Public method to process a message
  public async processMessage(
    state: Partial<LanggraphState>
  ): Promise<typeof StateAnnotation.State> {
    try {
      const result = await this.compiledGraph.invoke(state);
      return result;
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to process message through LangGraph");
    }
  }

  // Get the current state
  public async getState(threadId: string = "default") {
    try {
      const config = { configurable: { thread_id: threadId } };
      const state = await this.compiledGraph.getState(config);
      return state;
    } catch (error) {
      console.error("Error getting state:", error);
      throw new Error("Failed to get graph state");
    }
  }
}

export default LanggraphService;
