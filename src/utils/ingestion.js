import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

function resolveInputPath(inputPath) {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }

  return path.resolve(process.cwd(), inputPath);
}

function validateFeedbackRecord(record, index) {
  const requiredFields = ["id", "timestamp", "feedback_text"];

  for (const field of requiredFields) {
    if (!record[field]) {
      throw new Error(`Input record at index ${index} is missing required field "${field}".`);
    }
  }

  return {
    id: String(record.id),
    timestamp: String(record.timestamp),
    feedback_text: String(record.feedback_text).trim()
  };
}

export async function loadFeedbackFromCsv(csvPath) {
  const absolutePath = resolveInputPath(csvPath);
  const fileContents = await fs.readFile(absolutePath, "utf-8");

  const rows = parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return rows.map(validateFeedbackRecord);
}

export async function loadFeedbackFromJson(jsonPath) {
  const absolutePath = resolveInputPath(jsonPath);
  const fileContents = await fs.readFile(absolutePath, "utf-8");
  const parsed = JSON.parse(fileContents);

  if (!Array.isArray(parsed)) {
    throw new Error("JSON input must be an array of feedback objects.");
  }

  return parsed.map(validateFeedbackRecord);
}

export function normalizeFeedbackPayload(payload) {
  if (!Array.isArray(payload)) {
    throw new Error('The "feedback" payload must be an array.');
  }

  return payload.map(validateFeedbackRecord);
}

export async function writeJsonOutput(outputPath, data) {
  const absolutePath = resolveInputPath(outputPath);
  const directoryPath = path.dirname(absolutePath);

  await fs.mkdir(directoryPath, { recursive: true });
  await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), "utf-8");

  return absolutePath;
}
