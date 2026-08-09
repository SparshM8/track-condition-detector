import { useEffect, useState, useCallback } from "react";
import UploadPanel from "./components/UploadPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import { getTrend } from "./api.js";

const POLL_INTERVAL_MS = 4000;

export default function App() {
  const [trend, setTrend] = useState(null);

  const refreshTrend = useCallback(async () => {
    try {
      const data = await getTrend();
      setTrend(data);
    } catch (err) {
      console.error("Failed to fetch trend:", err.message);
    }
  }, []);

  useEffect(() => {
    refreshTrend();
    const interval = setInterval(refreshTrend, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshTrend]);

  return (
    <div className="app">
      <h1>Live Track Condition Detector</h1>
      <p className="subtitle">
        Upload track images to classify surface condition and track the drying/wetting trend
        over time.
      </p>

      <UploadPanel onNewReading={refreshTrend} />
      <TrendChart trend={trend} />
    </div>
  );
}
