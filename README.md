# Guest Feedback Severity Analyzer

Lightweight Node.js application that ingests guest feedback, analyzes each entry with OpenAI, computes a weighted severity score, and returns prioritized operational results through a CLI and Express API.

## Features

- CSV and JSON input support
- OpenAI-powered issue analysis
- Weighted severity scoring using:
  - safety risk
  - guest impact
  - brand/reputation risk
- JSON output export
- Console table sorted by severity descending
- Express API with `/health` and `/analyze`
- Optional lightweight dashboard at `/`
- Mock AI mode for offline testing

## Project Structure

```text
src/
  app.js
  cli.js
  routes/
  services/
  utils/
data/
public/
output/
```

## Requirements

- Node.js 20+
- OpenAI API key for live AI analysis

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`.

## Run Locally

Start the API server:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

The server starts on `http://localhost:3000` by default.

## Analyze Sample Data

Analyze sample CSV input:

```bash
npm run analyze:csv
```

Analyze sample JSON input:

```bash
npm run analyze:json
```

The CLI prints a console table and writes results to the `output/` directory.

## API Endpoints

### `GET /health`

Returns service status and runtime configuration.

### `POST /analyze`

Accepts guest feedback and returns analyzed results.

Request body examples:

```json
{
  "feedback": [
    {
      "id": "101",
      "timestamp": "2026-04-08T09:15:00Z",
      "feedback_text": "There was water leaking near the elevator and nobody addressed it."
    }
  ]
}
```

```json
{
  "jsonPath": "./data/mock-feedback.json"
}
```

```json
{
  "csvPath": "./data/guest-feedback.csv"
}
```

Response shape:

```json
{
  "meta": {
    "count": 1,
    "generated_at": "2026-04-08T12:00:00.000Z"
  },
  "results": [
    {
      "id": "101",
      "severity_score": 8.6,
      "category": "safety",
      "sentiment": "negative",
      "priority_level": "critical",
      "recommended_action": "Dispatch engineering immediately and secure the area."
    }
  ]
}
```

## AI Modes

- `AI_MODE=openai`: Uses the OpenAI API
- `AI_MODE=mock`: Uses a deterministic local fallback analyzer for testing without API access

## Scoring Method

The final severity score is computed from weighted risk factors:

- `45%` safety risk
- `35%` guest impact
- `20%` brand/reputation risk

The score is normalized to a `0-10` scale and then mapped to:

- `low`
- `medium`
- `high`
- `critical`

## Dashboard

Visit `http://localhost:3000` for a small browser UI that posts feedback to the same `/analyze` API endpoint.

## Notes

- The app processes entries sequentially by default to keep API usage predictable and error handling simpler.
- Mock mode is useful for demos, local development, and environments without network access.
