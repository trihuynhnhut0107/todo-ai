import { Annotation, StateGraph } from "@langchain/langgraph";
import { LangchainService } from "./langchain.service";

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
  blocked: Annotation<boolean>({
    reducer: (left, right) => right ?? left,
    default: () => false,
  }),
});

export type LanggraphState = typeof StateAnnotation.State;

export class LanggraphService {
  private compiledGraph: ReturnType<typeof this.buildGraph>;

  constructor(private langchainService: LangchainService) {
    this.compiledGraph = this.buildGraph();
  }

  // Node: Detect user intent
  private async detectIntent(state: typeof StateAnnotation.State) {
    console.log("Detecting intent for user:", state.userName);
    console.log("Messages:", state.messages);

    // Get the last message
    const lastMessage = state.messages[state.messages.length - 1] || "";

    // Use LangchainService to detect intent with LLM
    try {
      const intentPrompt = `Analyze this message and determine the user's intent. 
Message: "${lastMessage}"

Respond with ONLY one of these intents:
- create_todo
- update_todo
- delete_todo
- list_todos
- general_chat`;

      const llmResponse = await this.langchainService.generateResponse(
        intentPrompt
      );

      // Parse the intent from LLM response
      const detectedIntent = llmResponse
        .toLowerCase()
        .trim()
        .includes("create_todo")
        ? "create_todo"
        : llmResponse.toLowerCase().trim().includes("update_todo")
        ? "update_todo"
        : llmResponse.toLowerCase().trim().includes("delete_todo")
        ? "delete_todo"
        : llmResponse.toLowerCase().trim().includes("list_todos")
        ? "list_todos"
        : "general_chat";

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

  // Gate function: Check if user is blocked
  private checkUserStatus(state: typeof StateAnnotation.State): string {
    if (state.blocked) {
      return "blocked";
    }
    return "allowed";
  }

  // Node: Generate chatbot response
  private async generateResponse(state: typeof StateAnnotation.State) {
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

  // Node: Handle blocked user
  private async handleBlockedUser(state: typeof StateAnnotation.State) {
    console.log("User is blocked:", state.userName);
    return {
      response: "Sorry, your account has been blocked. Please contact support.",
    };
  }

  // Build the workflow graph
  private buildGraph() {
    const graph = new StateGraph(StateAnnotation)
      .addNode("detectIntent", this.detectIntent.bind(this))
      .addNode("generateResponse", this.generateResponse.bind(this))
      .addNode("handleBlockedUser", this.handleBlockedUser.bind(this))
      .addEdge("__start__", "detectIntent")
      .addConditionalEdges("detectIntent", this.checkUserStatus.bind(this), {
        allowed: "generateResponse",
        blocked: "handleBlockedUser",
      })
      .addEdge("generateResponse", "__end__")
      .addEdge("handleBlockedUser", "__end__");

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
}

export default LanggraphService;
