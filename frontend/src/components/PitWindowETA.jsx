// Predicts how many minutes until the track crosses the next wetness
// threshold (Dry=0, Drying=1, Damp=2, Wet=3), using a simple linear
// regression over the last few readings. Pure math on data we already
// have — no extra API calls, no extra cost.

const LEVELS = ["Dry", "Drying", "Damp", "Wet"];

function linearRegressionSlope(points) {
  // points: [{ x: minutesSinceFirst, y: wetnessIndex }]
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function computePrediction(readings) {
  if (!Array.isArray(readings) || readings.length < 2) return null;

  // Use the last 5 readings for a recency-weighted but stable trend line
  const recent = readings.slice(-5);
  const t0 = new Date(recent[0].timestamp).getTime();
  const points = recent.map((r) => ({
    x: (new Date(r.timestamp).getTime() - t0) / 60000, // minutes since first
    y: r.wetnessIndex,
  }));

  const { slope, intercept } = linearRegressionSlope(points);
  const lastPoint = points[points.length - 1];
  const currentIndex = slope * lastPoint.x + intercept;

  // Rate too small to mean anything — treat as stable
  if (Math.abs(slope) < 0.02) {
    return { status: "stable" };
  }

  const nextThreshold =
    slope > 0 ? Math.min(3, Math.floor(currentIndex) + 1) : Math.max(0, Math.ceil(currentIndex) - 1);

  if (nextThreshold === Math.round(currentIndex) || (slope > 0 && currentIndex >= 3) || (slope < 0 && currentIndex <= 0)) {
    return { status: "at-limit", direction: slope > 0 ? "wetting" : "drying" };
  }

  const etaMinutes = (nextThreshold - currentIndex) / slope;
  if (!isFinite(etaMinutes) || etaMinutes < 0 || etaMinutes > 180) {
    return { status: "uncertain" };
  }

  return {
    status: "predicted",
    direction: slope > 0 ? "wetting" : "drying",
    etaMinutes,
    nextLabel: LEVELS[nextThreshold],
  };
}

function formatETA(minutes) {
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `~${h}h ${m}m`;
}

export default function PitWindowETA({ trend }) {
  const prediction = computePrediction(trend?.readings);

  if (!prediction) {
    return null; // not enough data yet — stay silent rather than showing a placeholder
  }

  let content;
  if (prediction.status === "stable") {
    content = (
      <>
        <span className="eta-dot eta-dot-stable" />
        <span>Conditions steady — no threshold crossing predicted</span>
      </>
    );
  } else if (prediction.status === "at-limit") {
    content = (
      <>
        <span className={`eta-dot ${prediction.direction === "wetting" ? "eta-dot-wet" : "eta-dot-dry"}`} />
        <span>
          Already at {prediction.direction === "wetting" ? "wettest" : "driest"} reading —
          continuing to {prediction.direction === "wetting" ? "worsen" : "improve"}
        </span>
      </>
    );
  } else if (prediction.status === "uncertain") {
    content = (
      <>
        <span className="eta-dot eta-dot-stable" />
        <span>Not enough consistent trend data yet to predict a window</span>
      </>
    );
  } else {
    content = (
      <>
        <span className={`eta-dot ${prediction.direction === "wetting" ? "eta-dot-wet" : "eta-dot-dry"}`} />
        <span>
          Estimated <strong>{formatETA(prediction.etaMinutes)}</strong> until track reaches{" "}
          <strong>{prediction.nextLabel}</strong> — plan pit window accordingly
        </span>
      </>
    );
  }

  return (
    <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
      {content}
    </div>
  );
}
