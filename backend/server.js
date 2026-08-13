// import dns from "node:dns";

// dns.setServers(["1.1.1.1", "8.8.8.8"]);
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import path from "path";

// import analyzeRouter from "./routes/analyze.js";
// import analyzeVideoRouter from "./routes/analyzeVideo.js";
// import trendRouter from "./routes/trend.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static(path.resolve("uploads")));

// app.use("/api/analyze", analyzeRouter);
// app.use("/api/analyze-video", analyzeVideoRouter);
// app.use("/api/trend", trendRouter);

// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // Basic error handler (e.g. multer file-type rejections)
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(400).json({ error: err.message || "Something went wrong" });
// });

// async function start() {
//   try {
//     if (process.env.MONGODB_URI) {
//       await mongoose.connect(process.env.MONGODB_URI);
//       console.log("Connected to MongoDB");
//     } else {
//       console.warn(
//         "No MONGODB_URI set — copy .env.example to .env and add your connection string"
//       );
//     }
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("Failed to start server:", err.message);
//     process.exit(1);
//   }
// }

// start();
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import analyzeRouter from "./routes/analyze.js";
import analyzeVideoRouter from "./routes/analyzeVideo.js";
import trendRouter from "./routes/trend.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/analyze", analyzeRouter);
app.use("/api/analyze-video", analyzeVideoRouter);
app.use("/api/trend", trendRouter);

// Health check now also reports DB status, so frontend can tell
// "backend up but DB down" apart from "backend fully offline"
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Basic error handler (e.g. multer file-type rejections)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Something went wrong" });
});

// --- Start the HTTP server immediately, independent of MongoDB ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- Connect to MongoDB separately, with retry, without killing the server ---
async function connectDB(retryDelayMs = 5000) {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "No MONGODB_URI set — copy .env.example to .env and add your connection string"
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging forever
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.log(`Retrying MongoDB connection in ${retryDelayMs / 1000}s...`);
    setTimeout(() => connectDB(retryDelayMs), retryDelayMs);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected — will retry");
  connectDB();
});

connectDB();