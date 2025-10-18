import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { LanggraphService } from "../services/langgraph.service";
import { LangchainService } from "../services/langchain.service";

const router = Router();

// Instantiate services
const langchainService = new LangchainService();
const langgraphService = new LanggraphService(langchainService);

// Inject service into controller
const chatController = new ChatController(langgraphService);

// Define routes
router.post("/chat/message", chatController.processMessage);

export default router;
