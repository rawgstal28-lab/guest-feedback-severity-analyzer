import express from "express";
import { analyzeFeedbackBatch } from "../services/feedbackAnalyzer.js";
import {
  loadFeedbackFromCsv,
  loadFeedbackFromJson,
  normalizeFeedbackPayload,
  writeJsonOutput
} from "../utils/ingestion.js";

const router = express.Router();

async function resolveFeedbackInput(body = {}) {
  if (Array.isArray(body.feedback)) {
    return normalizeFeedbackPayload(body.feedback);
  }

  if (body.csvPath) {
    return loadFeedbackFromCsv(body.csvPath);
  }

  if (body.jsonPath) {
    return loadFeedbackFromJson(body.jsonPath);
  }

  throw new Error('Provide one of "feedback", "csvPath", or "jsonPath" in the request body.');
}

router.post("/", async (request, response) => {
  try {
    const feedbackEntries = await resolveFeedbackInput(request.body);
    const results = await analyzeFeedbackBatch(feedbackEntries);

    const payload = {
      meta: {
        count: results.length,
        generated_at: new Date().toISOString()
      },
      results
    };

    if (request.body.outputPath) {
      payload.output_file = await writeJsonOutput(request.body.outputPath, payload);
    }

    response.json(payload);
  } catch (error) {
    response.status(400).json({
      error: "analysis_request_failed",
      message: error.message
    });
  }
});

export default router;
