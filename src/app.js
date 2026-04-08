import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import analyzeRoutes from "./routes/analyze.js";
import healthRoutes from "./routes/health.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.resolve(__dirname, "../public");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectory));

app.use("/health", healthRoutes);
app.use("/analyze", analyzeRoutes);

app.use((error, _request, response, _next) => {
  response.status(500).json({
    error: "internal_server_error",
    message: error.message
  });
});

app.listen(port, () => {
  console.log(`Guest Feedback Severity Analyzer running on http://localhost:${port}`);
});
