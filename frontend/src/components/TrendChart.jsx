import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const INDEX_TO_LABEL = ["Dry", "Drying", "Damp", "Wet"];

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TrendChart({ trend }) {
  if (!trend || trend.readings.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Track Trend</div>
        <p className="empty-state">No readings yet — analyze an image to start tracking.</p>
      </div>
    );
  }

  const chartData = trend.readings.map((r) => ({
    time: formatTime(r.timestamp),
    wetnessIndex: r.wetnessIndex,
    label: r.label,
  }));

  const lineColor =
    trend.trendDirection === "wetting"
      ? "#3498db"
      : trend.trendDirection === "drying"
      ? "#f1c40f"
      : "#2ecc71";

  const arrow =
    trend.trendDirection === "drying"
      ? { icon: "↓", label: "Track is drying", cls: "trend-arrow-drying" }
      : trend.trendDirection === "wetting"
      ? { icon: "↑", label: "Track is wetting", cls: "trend-arrow-wetting" }
      : trend.trendDirection === "stable"
      ? { icon: "→", label: "Track is stable", cls: "trend-arrow-stable" }
      : { icon: "—", label: "Waiting for data", cls: "trend-arrow-unknown" };

  const suggestionCardCls =
    trend.trendDirection === "drying"
      ? "suggestion-drying-card"
      : trend.trendDirection === "wetting"
      ? "suggestion-wetting-card"
      : trend.trendDirection === "stable"
      ? "suggestion-stable-card"
      : "suggestion-none-card";

  return (
    <div className="card">
      <div className="card-title">Track Trend</div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#2a2d36" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#9a9a9a" fontSize={12} />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={(v) => INDEX_TO_LABEL[v]}
            stroke="#9a9a9a"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{ background: "#171a21", border: "1px solid #2a2d36" }}
            labelStyle={{ color: "#e6e6e6" }}
            formatter={(value, name, props) => [props.payload.label, "Condition"]}
          />
          <Line
            type="monotone"
            dataKey="wetnessIndex"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`card suggestion-card ${suggestionCardCls}`} style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span className={`trend-arrow ${arrow.cls}`}>{arrow.icon}</span>
          <div>
            <div style={{ fontSize: 12, color: "#8b97a8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{arrow.label}</div>
            <div className="suggestion-text">{trend.suggestion}</div>
            <div className="slope-stat">Slope: {trend.slope >= 0 ? "+" : ""}{trend.slope.toFixed(2)} · Latest: {trend.latestLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
