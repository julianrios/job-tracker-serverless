import express from "express";
import cors from "cors";
import { healthHandler } from "./handlers/health";
import { listHandler, createHandler } from "./handlers/applications";

const app = express();
app.use(cors());
app.use(express.json()); // allows JSON request bodies

app.get("/health", healthHandler);

app.get("/applications", listHandler);
app.post("/applications", createHandler);

const port = 3001;
app.listen(port, () => {
  console.log(`✅ API running: http://localhost:${port}`);
});