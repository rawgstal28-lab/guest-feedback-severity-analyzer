export const CATEGORY_OPTIONS = ["safety", "service", "facilities", "operations", "other"];

export const SENTIMENT_OPTIONS = ["positive", "neutral", "negative"];

export const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

export function getDefaultModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}
