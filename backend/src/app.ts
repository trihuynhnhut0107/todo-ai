import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./generated/routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

// Serve swagger.json
app.get("/swagger.json", (req, res) => {
  res.sendFile(__dirname + "/generated/swagger.json");
});

// TSOA generated routes (auto-generated from controllers)
RegisterRoutes(app);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Todo AI API",
    version: "2.0",
    docs: "/api-docs",
    swagger: "/swagger.json",
    note: "All routes are now auto-generated via TSOA",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;
