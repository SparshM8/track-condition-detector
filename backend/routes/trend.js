import express from "express";
import Reading from "../models/Reading.js";
import { computeSlope, deriveSuggestion } from "../utils/trend.js";

const router = express.Router();

const TREND_WINDOW = parseInt(process.env.TREND_WINDOW || "10", 10);

function asText(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object" && typeof value.message === "string") {
    return value.message;
  }
  return fallback;
}

// GET /api/trend - recent readings + computed trend + suggestion
router.get("/", async (req, res) => {
  const readings = await Reading.find()
    .sort({ timestamp: -1 })
    .limit(TREND_WINDOW)
    .lean();

  // Reverse so it's oldest -> newest for slope + chart purposes
  const chronological = readings.reverse();

  if (chronological.length === 0) {
    return res.json({
      readings: [],
      slope: 0,
      trendDirection: "unknown",
      suggestion: "No readings yet — upload an image to get started",
    });
  }

  const values = chronological.map((r) => r.wetnessIndex);
  const slope = computeSlope(values);
  const latestIndex = values[values.length - 1];
  const { trendDirection, suggestion } = deriveSuggestion(slope, latestIndex);

  res.json({
    readings: chronological,
    slope,
    trendDirection,
    suggestion: asText(suggestion, "Unable to derive suggestion"),
    latestLabel: asText(chronological[chronological.length - 1].label, ""),
  });
});

// GET /api/history - full history (for a longer chart / audit view)
router.get("/history", async (req, res) => {
  const readings = await Reading.find().sort({ timestamp: 1 }).lean();
  res.json(readings);
});

// DELETE /api/trend/history - clears all readings (careful: irreversible).
// A confirmation token is required in the JSON body so a stray or automated
// request can't wipe the entire reading history by accident.
router.delete("/history", async (req, res) => {
  const expectedToken = process.env.CLEAR_HISTORY_TOKEN || "clear-history";
  const { token } = (req.body && typeof req.body === "object") ? req.body : {};
  if (!token || token !== expectedToken) {
    return res.status(400).json({
      error: "Confirmation token required — send { token } in the JSON body",
    });
  }
  try {
    const result = await Reading.deleteMany({});
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to clear history" });
  }
});

export default router;