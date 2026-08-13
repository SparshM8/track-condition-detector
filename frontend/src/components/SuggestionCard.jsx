// Pit-wall strategy card: trend direction arrow + suggestion message.

export default function SuggestionCard({ trend }) {
  const direction = trend?.trendDirection || "unknown";
  const suggestion = trend?.suggestion || "No readings yet — upload an image to get started";
  const slope = typeof trend?.slope === "number" ? trend.slope : 0;
  const latestLabel = trend?.latestLabel;

  const arrow =
    direction === "drying"
      ? { icon: "↓", label: "Drying", cls: "trend-arrow-drying", cardCls: "suggestion-drying-card" }
      : direction === "wetting"
      ? { icon: "↑", label: "Wetting", cls: "trend-arrow-wetting", cardCls: "suggestion-wetting-card" }
      : direction === "stable"
      ? { icon: "→", label: "Stable", cls: "trend-arrow-stable", cardCls: "suggestion-stable-card" }
      : { icon: "—", label: "Awaiting data", cls: "trend-arrow-unknown", cardCls: "suggestion-none-card" };

  return (
    <div className={`card suggestion-card ${arrow.cardCls}`}>
      <div className="card-title">Pit Wall Suggestion</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <span className={`trend-arrow ${arrow.cls}`}>{arrow.icon}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 12,
              color: "#8b97a8",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Track is {arrow.label}
          </div>
          <div className="suggestion-text">{suggestion}</div>
          <div className="slope-stat">
            Slope {slope >= 0 ? "+" : ""}
            {slope.toFixed(2)}
            {latestLabel ? ` · Latest reading: ${latestLabel}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
