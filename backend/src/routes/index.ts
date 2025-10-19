import { Router } from "express";
import LangchainController from "../controllers/langchain.controller";
import { LangchainService } from "../services/langchain.service";
import { TaskController } from "../controllers/task.controller";
import { TaskService } from "../services/task.service";
import chatRoutes from "./chat.routes";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";

const router = Router();

// Instantiate service and inject into controller
const langchainService = new LangchainService();
const langchainController = new LangchainController(langchainService);

// Instantiate task service and controller for project tasks route
const taskService = new TaskService();
const taskController = new TaskController(taskService);

router.use("/auth", authRoutes);

router.use("/projects", projectRoutes);

router.use("/tasks", taskRoutes);

router.get("/projects/:projectId/tasks", taskController.getTasksByProject);

// Chat endpoint for testing bot responses (legacy)
router.post("/chat", langchainController.getResponse);

// New LangGraph chat routes with DI pattern
router.use("/", chatRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
