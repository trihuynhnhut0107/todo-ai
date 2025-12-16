import dotenv from "dotenv";
import app from "./src/app";
import { AppDataSource } from "./src/data-source";
import { initializeNotificationWorker } from "./src/services/notification-queue.service";
import {
  initializeEvaluationWorker,
  scheduleBatchEvaluation,
} from "./src/services/evaluation-queue.service";
import { PromptService } from "./src/services/prompt.service";
import "reflect-metadata";

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    // Initialize system prompt if needed
    try {
      const promptService = new PromptService();
      await promptService.initializeSystemPrompt();
    } catch (error) {
      console.warn("Failed to initialize system prompt:", error);
    }

    // Initialize notification worker for event reminders
    try {
      initializeNotificationWorker();
      initializeEvaluationWorker();

      // Schedule batch evaluation to run every hour (3600000 ms)
      // Also available: Manual trigger via POST /api/evaluation/trigger for demonstrations
      scheduleBatchEvaluation(3600000);
    } catch (error) {
      console.warn("Failed to initialize workers:", error);
      console.warn(
        "Background jobs will not work. Make sure Redis is running."
      );
    }

    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
      console.log(
        "Swagger is available at http://localhost:" + PORT + "/api-docs"
      );
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));
