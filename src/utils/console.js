import { sortBySeverity } from "./scoring.js";

export function printResultsTable(results) {
  const sortedResults = sortBySeverity(results);

  console.table(
    sortedResults.map((result) => ({
      id: result.id,
      category: result.category,
      sentiment: result.sentiment,
      severity: result.severity_score,
      priority: result.priority_level,
      recommendation: result.recommended_action
    }))
  );
}
