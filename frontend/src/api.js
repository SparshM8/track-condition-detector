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

export async function getTrend() {
  const { data } = await api.get("/trend");
  return data;
}

export async function getHistory() {
  const { data } = await api.get("/trend/history");
  return data;
}

export default api;
