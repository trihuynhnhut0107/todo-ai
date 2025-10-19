import { Router } from "express";
import LangchainController from "../controllers/langchain.controller";
import { LangchainService } from "../services/langchain.service";
import chatRoutes from "./chat.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Instantiate service and inject into controller
const langchainService = new LangchainService();
const langchainController = new LangchainController(langchainService);

// Authentication routes
router.use("/auth", authRoutes);

// Chat endpoint for testing bot responses (legacy)
router.post("/chat", langchainController.getResponse);

// New LangGraph chat routes with DI pattern
router.use("/", chatRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
