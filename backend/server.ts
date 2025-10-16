import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDatabase } from "./src/config/database";
import "./src/models"; // Register all models and associations

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
