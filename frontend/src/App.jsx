import { useEffect, useState, useCallback } from "react";
import DashboardHeader from "./components/DashboardHeader.jsx";
import ConditionHero from "./components/ConditionHero.jsx";
import SuggestionCard from "./components/SuggestionCard.jsx";
import UploadPanel from "./components/UploadPanel.jsx";
import LiveCameraPanel from "./components/LiveCameraPanel.jsx";
import VideoUploadPanel from "./components/VideoUploadPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import HistoryGallery from "./components/HistoryGallery.jsx";
import BackgroundVideo from "./components/BackgroundVideo.jsx";
import { getTrend } from "./api.js";

const POLL_INTERVAL_MS = 4000;

const TABS = [
  { id: "live", label: "Live camera", icon: "●" },
  { id: "video", label: "Video clip", icon: "▷" },
  { id: "image", label: "Single image", icon: "◫" },
  { id: "history", label: "History", icon: "☰" },
];

export default function App() {
  const [trend, setTrend] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [bgOpacity, setBgOpacity] = useState(0.08);

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
      <BackgroundVideo src="/background.mp4" opacity={bgOpacity} />
      <DashboardHeader />
      <div className="dashboard">
        <p className="page-subtitle">
          Feed in a live camera, a recorded clip, or a single photo — the AI classifies the
          track surface as <strong>Dry</strong>, <strong>Drying</strong>, <strong>Damp</strong>,
          or <strong>Wet</strong>, tracks the trend, and suggests the tire-change window.
        </p>

        <div className="hero-row">
          <ConditionHero trend={trend} />
          <SuggestionCard trend={trend} />
        </div>

        {activeTab === "live" && <LiveCameraPanel onNewReading={refreshTrend} />}
        {activeTab === "video" && <VideoUploadPanel onNewReadings={refreshTrend} />}
        {activeTab === "image" && <UploadPanel onNewReading={refreshTrend} />}

        {activeTab !== "history" && <TrendChart trend={trend} />}

        {activeTab === "history" && <HistoryGallery />}

        <div style={{ marginTop: 22 }}>
          <div className="tab-row">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Trend chart uses the last 10 readings; the history view keeps every reading.
            Re-analyzing with new images refreshes the live dashboard above.
          </p>
        </div>

        {/* Background video opacity control (adjust as needed) */}
        <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 60, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
          <label style={{ color: '#fff', fontSize: 12 }}>BG opacity: {Math.round(bgOpacity * 100)}%</label>
          <input type="range" min="0" max="0.6" step="0.01" value={bgOpacity} onChange={(e) => setBgOpacity(parseFloat(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
