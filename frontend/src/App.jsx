import { useEffect, useState, useCallback } from "react";
import DashboardHeader from "./components/DashboardHeader.jsx";
import ConditionHero from "./components/ConditionHero.jsx";
import SuggestionCard from "./components/SuggestionCard.jsx";
import UploadPanel from "./components/UploadPanel.jsx";
import LiveCameraPanel from "./components/LiveCameraPanel.jsx";
import VideoUploadPanel from "./components/VideoUploadPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import HistoryGallery from "./components/HistoryGallery.jsx";
import Background3D from "./components/Background3D.jsx";
import BackgroundVideo from "./components/BackgroundVideo.jsx";
import BarGraph from "./components/BarGraph.jsx";
import { usePitRadio } from "./utils/usePitRadio.js";
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
  const [bgOpacity, setBgOpacity] = useState(0.15);
  // Default to the placeholder background so something shows before the
  // first reading comes in; gets replaced with the latest reading's image.
  const [backgroundImage, setBackgroundImage] = useState("/background.jpg");
  const [pitRadioOn, setPitRadioOn] = useState(true);

  const refreshTrend = useCallback(async () => {
    try {
      const data = await getTrend();
      setTrend(data);
      // update background using latest reading image if available
      const latest = Array.isArray(data?.readings) && data.readings.length ? data.readings[data.readings.length - 1] : null;
      if (latest?.imageUrl) setBackgroundImage(latest.imageUrl);
    } catch (err) {
      console.error("Failed to fetch trend:", err.message);
    }
  }, []);

  useEffect(() => {
    refreshTrend();
    const interval = setInterval(refreshTrend, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshTrend]);

  // Speaks pit-wall suggestions out loud whenever the message changes.
  usePitRadio(trend, pitRadioOn);

  return (
    <div className="app">
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <BackgroundVideo src="/background.mp4" opacity={bgOpacity} />
        <Background3D imageUrl={backgroundImage} opacity={bgOpacity * 0.5} />
      </div>
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

        {activeTab === "live" && <LiveCameraPanel onNewReading={(r) => { refreshTrend(); if (r?.imageUrl) setBackgroundImage(r.imageUrl); }} />}
        {activeTab === "video" && <VideoUploadPanel onNewReadings={(data) => { refreshTrend(); const first = Array.isArray(data?.readings) && data.readings[0]; if (first?.imageUrl) setBackgroundImage(first.imageUrl); }} />}
        {activeTab === "image" && <UploadPanel onNewReading={(r) => { refreshTrend(); if (r?.imageUrl) setBackgroundImage(r.imageUrl); }} />}

        {activeTab !== "history" && <TrendChart trend={trend} />}

        {/* Show a bar graph below the chart when we have trend readings (visualizes recent wetnessIndex) */}
        {trend && Array.isArray(trend.readings) && trend.readings.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <BarGraph readings={trend.readings} />
          </div>
        )}

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

        {/* Pit radio voice-alert toggle */}
        <div style={{ position: 'fixed', right: 12, bottom: 60, zIndex: 60, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
          <button
            className="secondary"
            onClick={() => setPitRadioOn((v) => !v)}
            style={{ fontSize: 12 }}
          >
            {pitRadioOn ? "🔊 Pit Radio: ON" : "🔇 Pit Radio: OFF"}
          </button>
        </div>

        {/* Background opacity control (adjust as needed) */}
        <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 60, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
          <label style={{ color: '#fff', fontSize: 12 }}>BG opacity: {Math.round(bgOpacity * 100)}%</label>
          <input type="range" min="0" max="0.6" step="0.01" value={bgOpacity} onChange={(e) => setBgOpacity(parseFloat(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
