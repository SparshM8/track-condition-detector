import { useEffect, useRef, useState } from "react";

const FLAG_CONFIG = {
  Dry: { color: "#4ade80", label: "GREEN FLAG", text: "Track is dry" },
  Drying: { color: "#facc15", label: "YELLOW FLAG", text: "Track is drying" },
  Damp: { color: "#38bdf8", label: "BLUE FLAG", text: "Track is damp" },
  Wet: { color: "#ef4444", label: "RED FLAG", text: "Track is wet" },
};

const VISIBLE_MS = 4000;

// Fires on EVERY analyze result — including the very first one — not just
// on category changes. `trigger` must be a NEW object/value each time
// (even if the label repeats) so the effect always re-fires.
export default function FlagAlertOverlay({ label, trigger }) {
  const [flag, setFlag] = useState(null);
  const [visible, setVisible] = useState(false);
  const hideTimeout = useRef(null);

  useEffect(() => {
    if (!label || !FLAG_CONFIG[label]) return;
    if (trigger === undefined || trigger === null) return;

    setFlag({ ...FLAG_CONFIG[label] });
    setVisible(false); // reset first, in case one is already mid-animation
    // Force a reflow-safe re-trigger on the next tick
    requestAnimationFrame(() => setVisible(true));

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setVisible(false), VISIBLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => () => hideTimeout.current && clearTimeout(hideTimeout.current), []);

  if (!flag) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: visible ? 24 : -100,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 500,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "top 500ms ease, opacity 500ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(10,10,14,0.95)",
          border: `2px solid ${flag.color}`,
          boxShadow: `0 0 30px ${flag.color}88`,
          borderRadius: 12,
          padding: "14px 26px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 20,
            background: flag.color,
            borderRadius: 3,
            boxShadow: `0 0 12px ${flag.color}`,
          }}
        />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: flag.color }}>
            {flag.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{flag.text}</div>
        </div>
      </div>
    </div>
  );
}
