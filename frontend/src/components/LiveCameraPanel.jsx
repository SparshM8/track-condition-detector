import { useRef, useState, useEffect, useCallback } from "react";
import { analyzeImage } from "../api.js";
import ConditionBadge from "./ConditionBadge.jsx";
import { asText, extractErrorMessage } from "../utils/text.js";

const CAPTURE_INTERVAL_MS = 15000; // snapshot every 15s while live

export default function LiveCameraPanel({ onNewReading }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [captureCount, setCaptureCount] = useState(0);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], `live-${Date.now()}.jpg`, { type: "image/jpeg" });
        try {
          const result = await analyzeImage(file);
          setLastResult(result);
          setCaptureCount((c) => c + 1);
          onNewReading(result);
        } catch (err) {
          setError(extractErrorMessage(err, "Image analysis failed"));
        }
      },
      "image/jpeg",
      0.85
    );
  }, [onNewReading]);

  async function startLive() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // prefer rear camera on phones
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLive(true);
    } catch (err) {
      setError(`Could not access camera: ${extractErrorMessage(err, "Unknown error")}`);
    }
  }

  function stopLive() {
    setIsLive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    if (isLive) {
      // Capture immediately on start, then on the interval
      captureAndAnalyze();
      intervalRef.current = setInterval(captureAndAnalyze, CAPTURE_INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, captureAndAnalyze]);

  // Stop camera if component unmounts while live
  useEffect(() => {
    return () => stopLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <div className="card-title">Live camera feed</div>

      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          width: "100%",
          maxHeight: 320,
          borderRadius: 8,
          background: "#000",
          display: isLive ? "block" : "none",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!isLive && (
        <p style={{ color: "#9a9a9a", marginTop: 0 }}>
          Starts your camera and auto-analyzes a frame every {CAPTURE_INTERVAL_MS / 1000}s —
          good for a live trackside demo without needing to upload manually.
        </p>
      )}

      <div className="upload-row" style={{ marginTop: 12 }}>
        {!isLive ? (
          <button onClick={startLive}>Start live feed</button>
        ) : (
          <button onClick={stopLive} style={{ background: "#a83d3d" }}>
            Stop live feed
          </button>
        )}
        {isLive && (
          <span style={{ color: "#9a9a9a", fontSize: 13 }}>
            Captures taken: {captureCount}
          </span>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}

      {lastResult && (
        <div style={{ marginTop: 14 }}>
          <ConditionBadge label={lastResult.label} confidence={lastResult.confidence} />
          <div className="meta-row">
            <span>Reasoning: {asText(lastResult.reasoning, "Not provided")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
