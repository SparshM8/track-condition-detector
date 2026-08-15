import { useEffect, useRef } from "react";

const TIRE_NAME = {
  Dry: "slick tires",
  Drying: "medium tires",
  Damp: "intermediate tires",
  Wet: "full wet tires",
};

const INTRO = {
  Dry: "Box, box. ",
  Drying: "",
  Damp: "",
  Wet: "Box, box. ",
};

// Fires on EVERY analyze result — including the first one — same pattern
// as FlagAlertOverlay. `trigger` must change every time (even for a
// repeated label) so speech fires reliably and isn't tied to trend polling.
export function usePitRadio(label, trigger, enabled) {
  const lastTrigger = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!label || trigger === undefined || trigger === null) return;
    if (trigger === lastTrigger.current) return; // avoid double-fire on re-renders
    lastTrigger.current = trigger;

    const tire = TIRE_NAME[label] || "appropriate tires";
    const intro = INTRO[label] || "";
    const message = `${intro}Track is ${label.toLowerCase()}. Recommend ${tire}.`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.95;
    utterance.pitch = 0.85; // slightly deeper, more "race engineer" tone
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      /male|david|daniel|google uk english male/i.test(v.name)
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.cancel(); // stop any overlapping speech first
    window.speechSynthesis.speak(utterance);
  }, [trigger, label, enabled]);
}
