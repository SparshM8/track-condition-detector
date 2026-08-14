import { useEffect, useRef } from "react";

// Speaks the pit-wall suggestion out loud, but only when the message
// actually changes — not on every poll — so it doesn't repeat itself
// every 4 seconds while conditions are stable.
export function usePitRadio(trend, enabled) {
  const lastSpoken = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const direction = trend?.trendDirection;
    const suggestion = trend?.suggestion;

    if (!suggestion || typeof suggestion !== "string") return;
    // Skip the initial "no readings yet" placeholder and unknown state
    if (!direction || direction === "unknown") return;
    // Only speak when the message is actually new
    if (suggestion === lastSpoken.current) return;
    lastSpoken.current = suggestion;

    const prefix = direction === "wetting" ? "Box, box. " : "";
    const utterance = new SpeechSynthesisUtterance(`${prefix}${suggestion}`);
    utterance.rate = 0.95;
    utterance.pitch = 0.85; // slightly deeper, more "race engineer" tone
    utterance.volume = 1;

    // Prefer a deeper/male-leaning voice if the browser has one available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      /male|david|daniel|google uk english male/i.test(v.name)
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.cancel(); // stop any overlapping speech first
    window.speechSynthesis.speak(utterance);
  }, [trend?.suggestion, trend?.trendDirection, enabled]);
}