import React from "react";

// Simple background video component. Place a video file at
// frontend/public/background.mp4 (or set src to a remote URL).
// The component is absolutely positioned behind the content.

export default function BackgroundVideo({ src = "/background.mp4", opacity = 0.08 }) {
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

  return (
    <div style={style} aria-hidden>
      <video style={videoStyle} src={src} autoPlay muted loop playsInline />
    </div>
  );
}
