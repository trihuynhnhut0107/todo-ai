import {
  Annotation,
  StateGraph,
  MemorySaver,
  Command,
  interrupt,
} from "@langchain/langgraph";
import { LangchainService } from "./langchain.service";
import { ChatService } from "./chat.service";

// Graph state
const StateAnnotation = Annotation.Root({
  userName: Annotation<string>({
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
  eventData: Annotation<{
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
  }>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({}),
  }),
  missingFields: Annotation<string[]>({
    reducer: (left, right) => right ?? left,
    default: () => [],
  }),
});

export type LanggraphState = typeof StateAnnotation.State;

export class LanggraphService {
  private compiledGraph: ReturnType<typeof this.buildGraph>;

  constructor(
    private langchainService: LangchainService,
    private chatService: ChatService
  ) {
    this.compiledGraph = this.buildGraph();
  }

  // Node: Detect user intent
  private async detectIntentNode(state: typeof StateAnnotation.State) {
    console.log("Detecting intent for user:", state.userName);
    console.log("Messages:", state.messages);

    // Get the last message
    const lastMessage = state.messages[state.messages.length - 1] || "";

    // Use LangchainService to detect intent with LLM
    try {
      const llmResponse = await this.langchainService.detectIntent(lastMessage);

      // Parse the intent from LLM response
      const detectedIntent = llmResponse.intent;

      console.log("Detected intent:", detectedIntent);
      return { intent: detectedIntent };
    } catch (error) {
      console.error("Error detecting intent with LLM:", error);
      // Fallback to simple keyword detection
      const detectedIntent = lastMessage.toLowerCase().includes("todo")
        ? "create_todo"
        : "general_chat";
      return { intent: detectedIntent };
    }
  }

  // Node: Generate chatbot response
  private async generateResponseNode(state: typeof StateAnnotation.State) {
    console.log("Generating response for intent:", state.intent);

    // Get the last message
    const lastMessage = state.messages[state.messages.length - 1] || "";

    // Use LangchainService to generate contextual response based on intent
    try {
      const responsePrompt = `You are a helpful AI assistant for a todo application.
User: ${state.userName}
Intent: ${state.intent}
Message: "${lastMessage}"

Generate a helpful response based on the user's intent. Be concise and friendly.`;

      const response = await this.langchainService.generateResponse(
        responsePrompt
      );

      console.log("Generated response:", response);
      return { response };
    } catch (error) {
      console.error("Error generating response with LLM:", error);
      // Fallback response
      return {
        response: `I understand you want to ${state.intent.replace(
          /_/g,
          " "
        )}. How can I help you with that?`,
      };
    }
  }

  // Node: Create event with interrupt for missing information
  private async createEventNode(state: typeof StateAnnotation.State) {
    console.log("Creating event with data:", state.eventData);

    const requiredFields = ["title", "startTime", "endTime"];
    const missing: string[] = [];

    // Check for missing required fields
    for (const field of requiredFields) {
      if (!state.eventData[field as keyof typeof state.eventData]) {
        missing.push(field);
      }
    }

    // If there are missing fields, interrupt and ask user
    if (missing.length > 0) {
      console.log("Missing fields:", missing);
      const fieldNames = missing.join(", ");

      // Use interrupt() to pause execution and wait for user input
      const userInput = interrupt({
        missingFields: missing,
        message: `To create this event, I need the following information: ${fieldNames}. Please provide these details.`,
      });

      console.log("Received user input after interrupt:", userInput);

      // After resume, userInput will contain the new data
      // Return command to update state with user-provided data
      return new Command({
        update: {
          eventData: { ...state.eventData, ...userInput },
          response: "Processing your event information...",
        },
      });
    }

    // All required fields present, create the event
    console.log("All required fields present, creating event");
    return {
      response: `Event created successfully! Title: ${state.eventData.title}, Time: ${state.eventData.startTime} to ${state.eventData.endTime}`,
      missingFields: [],
    };
  }

  // Build the workflow graph
  private buildGraph() {
    const graph = new StateGraph(StateAnnotation)
      .addNode("detectIntent", this.detectIntentNode.bind(this))
      .addNode("generateResponse", this.generateResponseNode.bind(this))
      .addNode("createEvent", this.createEventNode.bind(this))
      .addEdge("__start__", "detectIntent")
      .addConditionalEdges(
        "detectIntent",
        (state) => {
          if (state.intent === "create_todo") {
            return "createEvent";
          }
          return "generateResponse";
        },
        {
          createEvent: "createEvent",
          generateResponse: "generateResponse",
        }
      )
      .addEdge("generateResponse", "__end__")
      .addEdge("createEvent", "__end__");

    // Compile with MemorySaver for interrupt functionality
    const checkpointer = new MemorySaver();
    return graph.compile({
      checkpointer,
    });
  }

  // Public method to process a message
  public async processMessage(
    state: Partial<LanggraphState>,
    threadId: string = "default"
  ): Promise<typeof StateAnnotation.State> {
    try {
      const config = { configurable: { thread_id: threadId } };
      const result = await this.compiledGraph.invoke(state, config);
      return result;
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to process message through LangGraph");
    }
  }

  // Get the current state including interrupt information
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

  // Check if the graph is currently interrupted
  public async isInterrupted(threadId: string = "default"): Promise<boolean> {
    try {
      const state = await this.getState(threadId);
      // Check if there are any tasks with interrupt status
      return state.tasks?.some((task) => task.interrupts?.length > 0) || false;
    } catch (error) {
      console.error("Error checking interrupt status:", error);
      return false;
    }
  }

  // Resume execution from an interrupt with user-provided data
  public async resumeFromInterrupt(
    userInput: Record<string, unknown>,
    threadId: string = "default"
  ): Promise<typeof StateAnnotation.State> {
    try {
      const config = { configurable: { thread_id: threadId } };

      // Use Command to resume with the user input
      const resumeCommand = new Command({
        resume: userInput,
      });

      const result = await this.compiledGraph.invoke(resumeCommand, config);
      return result;
    } catch (error) {
      console.error("Error resuming from interrupt:", error);
      throw new Error("Failed to resume execution from interrupt");
    }
  }

  // Get interrupt details if the graph is interrupted
  public async getInterruptDetails(threadId: string = "default") {
    try {
      const state = await this.getState(threadId);

      if (!state.tasks) {
        return null;
      }

      // Find the task with interrupt information
      const interruptedTask = state.tasks.find(
        (task) => task.interrupts && task.interrupts.length > 0
      );

      if (!interruptedTask || !interruptedTask.interrupts) {
        return null;
      }

      return {
        node: interruptedTask.name,
        interrupts: interruptedTask.interrupts,
        currentState: state.values,
      };
    } catch (error) {
      console.error("Error getting interrupt details:", error);
      return null;
    }
  }
}

export default LanggraphService;
