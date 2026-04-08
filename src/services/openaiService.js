import OpenAI from "openai";
import { CATEGORY_OPTIONS, getDefaultModel, SENTIMENT_OPTIONS } from "../utils/constants.js";

const ANALYSIS_SCHEMA = {
  name: "guest_feedback_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: {
        type: "string",
        enum: CATEGORY_OPTIONS
      },
      sentiment: {
        type: "string",
        enum: SENTIMENT_OPTIONS
      },
      safety_risk: {
        type: "number",
        minimum: 0,
        maximum: 10
      },
      guest_impact: {
        type: "number",
        minimum: 0,
        maximum: 10
      },
      brand_reputation_risk: {
        type: "number",
        minimum: 0,
        maximum: 10
      },
      recommended_action: {
        type: "string"
      },
      rationale: {
        type: "string"
      }
    },
    required: [
      "category",
      "sentiment",
      "safety_risk",
      "guest_impact",
      "brand_reputation_risk",
      "recommended_action",
      "rationale"
    ]
  }
};

let cachedClient;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Add it to your .env file or use AI_MODE=mock.");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30_000,
      maxRetries: 2
    });
  }

  return cachedClient;
}

export async function analyzeFeedbackWithOpenAI(feedback) {
  const client = getClient();

  // Structured output keeps the ingestion and scoring layers deterministic.
  const response = await client.responses.create({
    model: getDefaultModel(),
    instructions: [
      "You analyze guest feedback for hotel or hospitality operations.",
      "Return valid JSON only using the provided schema.",
      "Score each risk factor from 0 to 10 where 10 is most severe.",
      "Recommended actions should be short, operational, and actionable."
    ].join(" "),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Analyze this guest feedback entry:
id: ${feedback.id}
timestamp: ${feedback.timestamp}
feedback_text: ${feedback.feedback_text}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        ...ANALYSIS_SCHEMA
      }
    }
  });

  if (!response.output_text) {
    throw new Error("OpenAI response did not contain structured output text.");
  }

  return JSON.parse(response.output_text);
}
