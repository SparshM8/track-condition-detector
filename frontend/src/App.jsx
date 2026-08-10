import { useEffect, useState, useCallback } from "react";
import UploadPanel from "./components/UploadPanel.jsx";
import LiveCameraPanel from "./components/LiveCameraPanel.jsx";
import VideoUploadPanel from "./components/VideoUploadPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import HistoryGallery from "./components/HistoryGallery.jsx";
import { getTrend } from "./api.js";

const POLL_INTERVAL_MS = 4000;

const TABS = [
  { id: "live", label: "Live camera" },
  { id: "video", label: "Video clip" },
  { id: "image", label: "Single image" },
  { id: "history", label: "History" },
];

export default function App() {
  const [trend, setTrend] = useState(null);
  const [activeTab, setActiveTab] = useState("live");

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
        Feed in a live camera, a recorded clip, or a single photo to classify surface condition
        and track the drying/wetting trend over time.
      </p>

      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "live" && <LiveCameraPanel onNewReading={refreshTrend} />}
      {activeTab === "video" && <VideoUploadPanel onNewReadings={refreshTrend} />}
      {activeTab === "image" && <UploadPanel onNewReading={refreshTrend} />}
      {activeTab === "history" && <HistoryGallery />}

      {activeTab !== "history" && <TrendChart trend={trend} />}
    </div>
  );
}