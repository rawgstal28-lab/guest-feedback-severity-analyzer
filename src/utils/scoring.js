const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

export function calculateSeverityScore({
  safety_risk = 0,
  guest_impact = 0,
  brand_reputation_risk = 0
}) {
  // Weighted operational severity model for consistent downstream prioritization.
  const weightedScore =
    (Number(safety_risk) * 0.45) +
    (Number(guest_impact) * 0.35) +
    (Number(brand_reputation_risk) * 0.2);

  return roundToOneDecimal(Math.max(0, Math.min(10, weightedScore)));
}

export function mapPriorityLevel(severityScore) {
  if (severityScore >= 8.5) {
    return "critical";
  }

  if (severityScore >= 6) {
    return "high";
  }

  if (severityScore >= 3.5) {
    return "medium";
  }

  return "low";
}

export function sortBySeverity(results) {
  return [...results].sort((left, right) => right.severity_score - left.severity_score);
}
