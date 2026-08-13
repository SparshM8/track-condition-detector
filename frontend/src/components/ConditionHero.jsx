// Big hero panel: current track condition, wetness gauge, confidence, reasoning.

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

// Only ever render strings/numbers in JSX. Protects against the backend
// ever sending back an error-shaped object instead of a plain string,
// which otherwise crashes the app with React error #31.
function asText(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") return value;
  return fallback;
}

const COLORS = {
  Dry: "#2ecc71",
  Drying: "#f1c40f",
  Damp: "#e67e22",
  Wet: "#3498db",
};

export default function ConditionHero({ trend }) {
  const latest = trend?.readings?.length
    ? trend.readings[trend.readings.length - 1]
    : null;
  const label = typeof latest?.label === "string" ? latest.label : null;
  const confidence = latest?.confidence;
  const source = latest?.source;
  const reasoning = asText(latest?.reasoning, "");
  const wetnessIndex = typeof latest?.wetnessIndex === "number" ? latest.wetnessIndex : null;

  const pct = wetnessIndex != null ? (wetnessIndex / 3) * 100 : 0;

  if (!label) {
    return (
      <div className="card">
        <div className="card-title">Current Condition</div>
        <div className="condition-hero">
          <div className="big-badge big-badge-dry" style={{ opacity: 0.5 }}>
            Waiting
          </div>
          <p className="empty-state" style={{ margin: 0 }}>
            No readings yet. Capture from the live camera, upload a video clip, or
            submit a single photo to classify the track surface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Current Condition</div>
      <div className="condition-hero">
        <div className="condition-title-row">
          <span className={`big-badge big-badge-${label.toLowerCase()}`}>{label}</span>
          {typeof confidence === "number" && (
            <span className="confidence-chip">Confidence {Math.round(confidence * 100)}%</span>
          )}
          {source && (
            <span className="source-chip">
              {source === "ai" ? "◈ AI (Claude Vision)" : "⚙ Local heuristic"}
            </span>
          )}
        </div>

        <div className="gauge-wrap">
          <div className="gauge-label-row">
            <span>Dry</span>
            <span>Drying</span>
            <span>Damp</span>
            <span>Wet</span>
          </div>
          <div className="gauge-track">
            <div
              className="gauge-fill"
              style={{ width: `${pct}%`, background: COLORS[label] }}
            />
            <div className="gauge-marker" style={{ left: `${pct}%` }}>
              <div
                className="gauge-marker-dot"
                style={{ background: COLORS[label] }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#8b97a8" }}>
            <span>Wetness index: <strong style={{ color: "#e8edf4" }}>{wetnessIndex ?? "—"}</strong> / 3</span>
            <span className="last-updated">Updated {formatTime(latest.timestamp)}</span>
          </div>
        </div>

        {reasoning && <p className="reasoning">"{reasoning}"</p>}
      </div>
    </div>
  );
}