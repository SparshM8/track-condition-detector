/**
 * Compute a simple linear trend (slope) over a series of wetness index values.
 * Uses least-squares slope over the index positions (0, 1, 2, ...) vs value.
 * Positive slope = getting wetter. Negative slope = getting drier.
 */
export function computeSlope(values) {
  const n = values.length;
  if (n < 2) return 0;

  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (values[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Turn a slope + current wetness index into a human-readable trend
 * direction and a tire-change suggestion. Thresholds are tunable.
 */
export function deriveSuggestion(slope, latestIndex) {
  const DRYING_THRESHOLD = -0.3;
  const WETTING_THRESHOLD = 0.3;

  let trendDirection;
  let suggestion;

  if (slope <= DRYING_THRESHOLD) {
    trendDirection = "drying";
    suggestion =
      latestIndex <= 1
        ? "Track drying fast: tire change window approaching"
        : "Track drying: monitor closely for the tire change window";
  } else if (slope >= WETTING_THRESHOLD) {
    trendDirection = "wetting";
    suggestion =
      latestIndex >= 2
        ? "Track getting wetter: consider wet tires"
        : "Track wetting: watch conditions closely";
  } else {
    trendDirection = "stable";
    suggestion =
      latestIndex <= 0.5
        ? "Track stable and dry"
        : latestIndex >= 2.5
        ? "Track stable and wet"
        : "Track conditions steady, no action needed";
  }

  return { trendDirection, suggestion };
}
