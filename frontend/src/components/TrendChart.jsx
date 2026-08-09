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
        <div className="section-title">Trend</div>
        <p style={{ color: "#9a9a9a" }}>No readings yet — analyze an image to start tracking.</p>
      </div>
    );
  }

  const chartData = trend.readings.map((r) => ({
    time: formatTime(r.timestamp),
    wetnessIndex: r.wetnessIndex,
    label: r.label,
  }));

  const bannerClass =
    trend.trendDirection === "drying"
      ? "suggestion-drying"
      : trend.trendDirection === "wetting"
      ? "suggestion-wetting"
      : "suggestion-stable";

  return (
    <div className="card">
      <div className="section-title">Trend</div>

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
            stroke="#3d7bfd"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`suggestion-banner ${bannerClass}`}>
        {trend.suggestion}
      </div>

      <div className="meta-row">
        <span>Trend direction: {trend.trendDirection}</span>
        <span>Slope: {trend.slope.toFixed(2)}</span>
        <span>Latest: {trend.latestLabel}</span>
      </div>
    </div>
  );
}
