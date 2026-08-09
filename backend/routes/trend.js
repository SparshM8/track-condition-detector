import express from "express";
import Reading from "../models/Reading.js";
import { computeSlope, deriveSuggestion } from "../utils/trend.js";

const router = express.Router();

const TREND_WINDOW = parseInt(process.env.TREND_WINDOW || "10", 10);

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
    suggestion,
    latestLabel: chronological[chronological.length - 1].label,
  });
});

// GET /api/history - full history (for a longer chart / audit view)
router.get("/history", async (req, res) => {
  const readings = await Reading.find().sort({ timestamp: 1 }).lean();
  res.json(readings);
});

export default router;
