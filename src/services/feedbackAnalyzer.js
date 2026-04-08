import { analyzeFeedbackWithMockAi } from "./mockAiService.js";
import { analyzeFeedbackWithOpenAI } from "./openaiService.js";
import { calculateSeverityScore, mapPriorityLevel, sortBySeverity } from "../utils/scoring.js";

function resolveAiMode() {
  return (process.env.AI_MODE || "openai").toLowerCase();
}

async function analyzeSingleFeedback(feedback) {
  const aiMode = resolveAiMode();
  const aiResult = aiMode === "mock"
    ? await analyzeFeedbackWithMockAi(feedback)
    : await analyzeFeedbackWithOpenAI(feedback);

  const severityScore = calculateSeverityScore(aiResult);

  return {
    ...feedback,
    ...aiResult,
    severity_score: severityScore,
    priority_level: mapPriorityLevel(severityScore)
  };
}

export async function analyzeFeedbackBatch(feedbackEntries) {
  const results = [];

  for (const feedback of feedbackEntries) {
    try {
      const analyzedFeedback = await analyzeSingleFeedback(feedback);
      results.push(analyzedFeedback);
    } catch (error) {
      // Keep failed items visible so operations teams can still triage them manually.
      results.push({
        ...feedback,
        severity_score: 0,
        category: "other",
        sentiment: "neutral",
        priority_level: "low",
        recommended_action: "Manual review required due to analysis failure.",
        processing_error: error.message
      });
    }
  }

  return sortBySeverity(results);
}
