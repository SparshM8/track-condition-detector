import { useState } from "react";
import { analyzeImage } from "../api.js";
import { getBrowserLocation, fetchWeather } from "../utils/weather.js";
import { asText, extractErrorMessage } from "../utils/text.js";
import ConditionBadge from "./ConditionBadge.jsx";

// Resizes/compresses an image client-side before upload — a raw 4-8MB
// phone photo becomes a ~150-400KB JPEG, which is what was making Gemini
// classification take ~2 minutes (large base64 payload = slow upload +
// slow model processing). Caps the longest side at 1280px, which is more
// than enough detail for surface-condition classification.
function resizeImage(file, maxDimension = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to resize image"));
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };
    img.src = url;
  });
}

export default function UploadPanel({ onNewReading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [weather, setWeather] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
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

  async function handleAutoWeather() {
    setWeatherLoading(true);
    setError(null);
    try {
      const { lat, lon } = await getBrowserLocation();
      const result = await fetchWeather(lat, lon);
      setWeather(result);
    } catch (err) {
      setError(`Could not auto-detect weather: ${extractErrorMessage(err, "Unknown error")}`);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const resized = await resizeImage(file);
      const result = await analyzeImage(resized, weather);
      setLastResult(result);
      onNewReading(result);
    } catch (err) {
      setError(extractErrorMessage(err, "Image analysis failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-title">Upload a track image</div>
      <div className="upload-row">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Weather info (optional)"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        />
        <button onClick={handleAutoWeather} disabled={weatherLoading} className="secondary">
          {weatherLoading ? "Detecting..." : "Auto-detect"}
        </button>
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
            <span>Reasoning: {asText(lastResult.reasoning, "Not provided")}</span>
            <span>Source: {asText(lastResult.source, "unknown")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
