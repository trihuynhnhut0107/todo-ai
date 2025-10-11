import express from "express";
import routes from "./routes/index";

const app = express();

app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + CommonJS!");
});

export default app;
