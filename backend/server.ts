import dotenv from "dotenv";
import app from "./src/app";
import { AppDataSource } from "./src/data-source";
import { initializeNotificationWorker } from "./src/services/notification-queue.service";
import "reflect-metadata";

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    // Initialize notification worker for event reminders
    try {
      initializeNotificationWorker();
    } catch (error) {
      console.warn("Failed to initialize notification worker:", error);
      console.warn(
        "Push notifications will not work. Make sure Redis is running."
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
