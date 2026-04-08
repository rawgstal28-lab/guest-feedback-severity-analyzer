import dotenv from "dotenv";
import path from "node:path";
import { analyzeFeedbackBatch } from "./services/feedbackAnalyzer.js";
import { printResultsTable } from "./utils/console.js";
import { loadFeedbackFromCsv, loadFeedbackFromJson, writeJsonOutput } from "./utils/ingestion.js";

dotenv.config();

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    if (token === "--csv") {
      args.csvPath = nextToken;
      index += 1;
    } else if (token === "--json") {
      args.jsonPath = nextToken;
      index += 1;
    } else if (token === "--out") {
      args.outputPath = nextToken;
      index += 1;
    }
  }

  return args;
}

async function loadInput({ csvPath, jsonPath }) {
  if (csvPath) {
    return loadFeedbackFromCsv(csvPath);
  }

  if (jsonPath) {
    return loadFeedbackFromJson(jsonPath);
  }

  throw new Error('Usage: node src/cli.js --csv <path> [--out <path>] or --json <path> [--out <path>]');
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const feedbackEntries = await loadInput(args);
    const results = await analyzeFeedbackBatch(feedbackEntries);

    const payload = {
      meta: {
        count: results.length,
        generated_at: new Date().toISOString(),
        source: args.csvPath ? path.resolve(args.csvPath) : path.resolve(args.jsonPath)
      },
      results
    };

    printResultsTable(results);

    if (args.outputPath) {
      const outputFile = await writeJsonOutput(args.outputPath, payload);
      console.log(`Saved JSON output to ${outputFile}`);
    }
  } catch (error) {
    console.error(`CLI analysis failed: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
