require("dotenv").config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createEventPromptTemplate } from "../prompts/create-events.prompt";

class LangchainService {
  private static instance: LangchainService;
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-pro",
      temperature: 0,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  // Add singleton implementation
  public static getInstance(): LangchainService {
    if (!LangchainService.instance) {
      LangchainService.instance = new LangchainService();
    }
    return LangchainService.instance;
  }

  async generateResponse(input: string): Promise<string> {
    try {
      const currentDateTime = new Date().toISOString();
      const prompt = await createEventPromptTemplate.format({
        user_input: input,
        current_datetime: currentDateTime,
      });

      const response = await this.model.invoke(prompt);
      console.log(response);
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }
}

export default LangchainService;
