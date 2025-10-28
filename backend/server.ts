import dotenv from "dotenv";
import app from "./src/app";
import { AppDataSource } from "./src/data-source";
import "reflect-metadata";

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
      console.log(
        "Swagger is available at http://localhost:" + PORT + "/api-docs"
      );
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));
