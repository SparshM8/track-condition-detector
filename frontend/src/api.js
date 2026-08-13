// import axios from "axios";

// const api = axios.create({ baseURL: "/api" });

// export async function analyzeImage(file, weather = "") {
//   const formData = new FormData();
//   formData.append("image", file);
//   if (weather) formData.append("weather", weather);

//   const { data } = await api.post("/analyze", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// export async function analyzeVideo(file, onUploadProgress) {
//   const formData = new FormData();
//   formData.append("video", file);

//   const { data } = await api.post("/analyze-video", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     onUploadProgress,
//   });
//   return data;
// }

// export async function getHealth() {
//   const { data } = await api.get("/health");
//   return data;
// }

// export async function getTrend() {
//   const { data } = await api.get("/trend");
//   return data;
// }

// export async function getHistory() {
//   const { data } = await api.get("/trend/history");
//   return data;
// }

// export default api;

// // The backend requires a confirmation token to clear history, preventing
// // accidental wipes from stray or automated requests.
// const CLEAR_HISTORY_TOKEN = "clear-history";

// export async function clearHistory() {
//   const { data } = await api.delete("/trend/history", {
//     data: { token: CLEAR_HISTORY_TOKEN },
//   });
//   return data;
// }
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export async function analyzeImage(file, weather = "") {
  const formData = new FormData();
  formData.append("image", file);
  if (weather) formData.append("weather", weather);

  const { data } = await api.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function analyzeVideo(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("video", file);

  const { data } = await api.post("/analyze-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function getHealth() {
  // Short timeout — health checks should be fast; if it's this slow,
  // treat it as a failure rather than hanging and blocking the next check.
  const { data } = await api.get("/health", { timeout: 6000 });
  return data;
}

export async function getTrend() {
  try {
    const { data } = await api.get("/trend");
    return data;
  } catch (err) {
    // If backend /api/trend is not available (404/500) fall back to the
    // local sample data so the UI can still render a demo graph.
    console.warn("getTrend failed, falling back to sample data:", err.message);
    try {
      const res = await fetch('/sample-trend.json');
      if (res.ok) return await res.json();
      throw new Error(`Sample data fetch failed: ${res.status}`);
    } catch (fallbackErr) {
      console.error("Failed to load sample trend data:", fallbackErr);
      throw err; // rethrow original so callers know the request failed
    }
  }
}

export async function getHistory() {
  const { data } = await api.get("/trend/history");
  return data;
}

export default api;

// The backend requires a confirmation token to clear history, preventing
// accidental wipes from stray or automated requests.
const CLEAR_HISTORY_TOKEN = "clear-history";

export async function clearHistory() {
  const { data } = await api.delete("/trend/history", {
    data: { token: CLEAR_HISTORY_TOKEN },
  });
  return data;
}