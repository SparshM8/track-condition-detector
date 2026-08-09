import { useState } from "react";
import { analyzeImage } from "../api.js";
import ConditionBadge from "./ConditionBadge.jsx";

export default function UploadPanel({ onNewReading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [weather, setWeather] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage(file, weather);
      setLastResult(result);
      onNewReading(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="section-title">Upload a track image</div>
      <div className="upload-row">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Weather info (optional)"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={!file || loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {preview && <img className="preview-img" src={preview} alt="preview" />}

      {error && <div className="error-text">{error}</div>}

      {lastResult && (
        <div style={{ marginTop: 14 }}>
          <ConditionBadge label={lastResult.label} confidence={lastResult.confidence} />
          <div className="meta-row">
            <span>Reasoning: {lastResult.reasoning}</span>
            <span>Source: {lastResult.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}
