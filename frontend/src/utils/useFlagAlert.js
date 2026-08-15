import { useEffect, useRef, useState } from "react";

const FLAG_CONFIG = {
  Dry: { color: "#4ade80", label: "GREEN FLAG", text: "Track is dry" },
  Drying: { color: "#facc15", label: "YELLOW FLAG", text: "Track is drying" },
  Damp: { color: "#38bdf8", label: "BLUE FLAG", text: "Track is damp" },
  Wet: { color: "#ef4444", label: "RED FLAG", text: "Track is wet" },
};

const VISIBLE_MS = 4000;

// Tracks trend.latestLabel and triggers a temporary "active flag" whenever
// the category actually changes (not on every poll) — used to drive the
// dramatic banner animation.
export function useFlagAlert(trend) {
  const [activeFlag, setActiveFlag] = useState(null);
  const lastLabel = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const label = trend?.latestLabel;
    if (!label || !FLAG_CONFIG[label]) return;

    // Skip the very first reading — only flag actual *changes*
    if (lastLabel.current === null) {
      lastLabel.current = label;
      return;
    }

    if (label === lastLabel.current) return;
    lastLabel.current = label;

    setActiveFlag({ label, ...FLAG_CONFIG[label], key: Date.now() });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveFlag(null), VISIBLE_MS);
  }, [trend?.latestLabel]);

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  return activeFlag;
}
