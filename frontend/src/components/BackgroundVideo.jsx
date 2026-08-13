import React, { useState } from "react";

// Simple background video component. Place a video file at
// frontend/public/background.mp4 (or set src to a remote URL).
// The component is absolutely positioned behind the content.

export default function BackgroundVideo({ src = "/background.mp4", opacity = 0.08 }) {
  const [showVideo, setShowVideo] = useState(true);

  const style = {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    overflow: "hidden",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: opacity,
  };

  const videoStyle = {
    minWidth: "100%",
    minHeight: "100%",
    objectFit: "cover",
    transform: "translateZ(0)",
    filter: "saturate(0.9) contrast(0.9)",
  };

  const fallbackStyle = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg,#071228 0%, #0e2430 60%, #071827 100%)',
    zIndex: -1,
    pointerEvents: 'none'
  };

  return (
    <div style={style} aria-hidden>
      {showVideo ? (
        <video
          style={videoStyle}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setShowVideo(false)}
          onLoadedData={() => setShowVideo(true)}
        />
      ) : (
        <div style={fallbackStyle} />
      )}
    </div>
  );
}
