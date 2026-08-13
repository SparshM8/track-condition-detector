import React, { useEffect, useRef } from "react";

// Lightweight animated background that adapts to a source image's dominant
// colors. No external dependencies. It uses layered blurred divs animated via
// CSS transforms to create a 3D-like parallax/video feel.

function sampleImageColors(img, sampleCount = 5) {
  try {
    const canvas = document.createElement("canvas");
    const w = (canvas.width = img.naturalWidth || img.width || 100);
    const h = (canvas.height = img.naturalHeight || img.height || 100);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, Math.min(w, 100), Math.min(h, 100)).data;
    const counts = {};
    for (let i = 0; i < data.length; i += 4 * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // bucket colors coarsely
      const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.slice(0, sampleCount).map((e) => `rgb(${e[0]})`);
  } catch (err) {
    return ["#111", "#222", "#333"];
  }
}

export default function Background3D({ imageSrc, opacity = 0.08 }) {
  const ref = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    let mounted = true;
    const container = ref.current;
    if (!container) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc || "/background.jpg";
    img.onload = () => {
      if (!mounted) return;
      const colors = sampleImageColors(img, 4);
      // create/update layers
      const layers = colors.map((c, i) => {
        const el = layersRef.current[i] || document.createElement("div");
        el.style.position = "absolute";
        el.style.inset = "-20%";
        el.style.background = `linear-gradient(120deg, ${c}, rgba(0,0,0,0))`;
        el.style.filter = `blur(${20 - i * 4}px) saturate(${1 + i * 0.2})`;
        el.style.transform = `translateZ(${i * 50}px) scale(${1 + i * 0.05})`;
        el.style.opacity = String(opacity * (0.9 - i * 0.12));
        el.style.transition = "transform 2000ms ease, opacity 1200ms ease";
        layersRef.current[i] = el;
        return el;
      });

      // clear container and append layers in order
      container.innerHTML = "";
      layers.forEach((el) => container.appendChild(el));

      // animate layers subtly
      let t = 0;
      function frame() {
        t += 0.0025;
        for (let i = 0; i < layers.length; i++) {
          const el = layers[i];
          const xa = Math.sin(t * (0.6 + i * 0.2)) * (10 + i * 8);
          const ya = Math.cos(t * (0.4 + i * 0.15)) * (6 + i * 6);
          el.style.transform = `translate(${xa}px, ${ya}px) scale(${1 + i * 0.04})`;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };

    img.onerror = () => {
      // fallback: simple dark layers
      const defaultColors = ["#08121a", "#0e2229", "#11252b"];
      container.innerHTML = "";
      defaultColors.forEach((c, i) => {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.inset = "-20%";
        el.style.background = `linear-gradient(120deg, ${c}, rgba(0,0,0,0))`;
        el.style.filter = `blur(${18 - i * 4}px)`;
        el.style.opacity = String(opacity * (0.9 - i * 0.12));
        container.appendChild(el);
      });
    };

    return () => {
      mounted = false;
    };
  }, [imageSrc, opacity]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden
    />
  );
}
