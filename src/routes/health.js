import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ai_mode: process.env.AI_MODE || "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  });
});

export default router;
