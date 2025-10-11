import { Router } from "express";
import LangchainController from "../controllers/langchain.controller";

const router = Router();
const langchainController = new LangchainController();

// Chat endpoint for testing bot responses
router.post("/chat", langchainController.getResponse);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
