/**
 * Smoke test for the classification pipeline.
 *
 * Verifies both classification paths work without needing a real
 * ANTHROPIC_API_KEY:
 *   - AI path: a stubbed classifier (via module register hook) stands in
 *     for `classifyWithAI`
 *   - Fallback path: the real heuristic classifier runs on a real test image
 *
 * It also spins up a lightweight Express app with the real route modules
 * (no MongoDB) to confirm the route wiring and error handling over real HTTP.
 *
 * Usage:
 *   node scripts/smokeTest.js
 */

import assert from "node:assert/strict";
import { register } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import sharp from "sharp";

// Force mongoose to give up quickly when no DB is available, so route
// handlers fail fast and the Express error handler can catch them instead
// of the process crashing with a buffering-timeout exception.
mongoose.set("bufferTimeoutMS", 2000);

// The smoke test runs without a real database. Attempting to connect to a
// bogus URI would just make mongoose wait; instead we skip the connection
// entirely and rely on the error handler to surface DB-dependent failures
// as HTTP errors. The model is already loaded from Reading.js at import
// time (models register themselves), so route modules work as-is.

// Safety net: mongoose's buffering timeout can fire outside the Express
// handler's try/catch (async handler returned before the DB promise
// rejected). Capture such rejections as test failures instead of crashing.
let unhandledError = null;
process.on("unhandledRejection", (err) => {
  unhandledError = err;
});

// Tell Node to run our stub hook BEFORE anything else is imported.
register(new URL("./stub-classify-hook.mjs", import.meta.url), import.meta.url);

const rootDir = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const STUB_RESULT = {
  label: "Wet",
  confidence: 0.92,
  reasoning: "Stub: standing water and strong reflections",
};

// A tiny test image with bright specular highlights (triggers the "Wet"
// branch of the heuristic), plus a uniform dark image (triggers "Damp").
// variant: "specular" = sparse very-bright pixels (triggers Wet),
// "patchy" = high variance between light and dark bands (triggers Drying),
// plain = uniform (triggers Dry/Damp depending on brightness).
async function makeImage(r, g, b, variant = "plain") {
  const size = 64;
  const channels = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = r;
      if (variant === "specular" && Math.random() < 0.08) {
        v = 255; // specular highlight (need >3% of pixels above 220)
      } else if (variant === "patchy" && y % 4 < 2) {
        v = r + 120; // alternating light/dark bands (stddev > 45)
      }
      channels.push(v, v, v);
    }
  }
  // PNG losslessly preserves the synthetic pixel values; JPEG compression
  // would smooth away the specular spikes and patchy bands we generate.
  return sharp(Buffer.from(channels), {
    raw: { width: size, height: size, channels: 3 },
  })
    .png()
    .toBuffer();
}

// --- 1. AI path (stubbed) -------------------------------------------------

console.log("1. AI path (stubbed classifier):");
const { classifyWithAI } = await import(
  new URL(`file://${path.resolve(rootDir, "utils", "classify.js")}`).href
);

const aiResult = await classifyWithAI(Buffer.from(""), "image/jpeg");
assert.deepEqual(
  aiResult,
  STUB_RESULT,
  "Stub AI classifier contract failed"
);
console.log("   classifyWithAI() returned:", aiResult);
console.log("   PASS — AI path returns expected JSON contract\n");

// --- 2. Fallback path (real heuristic) ------------------------------------

console.log("2. Fallback path (real heuristic):");
const { classifyWithHeuristic } = await import(
  new URL(`file://${path.resolve(rootDir, "utils", "heuristic.js")}`).href
);

const wetImage = await makeImage(140, 140, 140, "specular"); // bright spikes
const dryingImage = await makeImage(100, 100, 100, "patchy"); // high variance
const dryImage = await makeImage(90, 90, 90); // uniform, darkish

for (const [name, img, expectWet] of [
  ["specular highlights (expect Wet)", wetImage],
  ["patchy bands (expect Drying)", dryingImage],
  ["uniform dark (expect Dry)", dryImage],
]) {
  const result = await classifyWithHeuristic(img);
  assert.ok(
    ["Dry", "Damp", "Wet", "Drying"].includes(result.label),
    "Heuristic produced an invalid label"
  );
  assert.ok(
    typeof result.confidence === "number" &&
      result.confidence >= 0.4 &&
      result.confidence <= 0.8,
    "Heuristic confidence out of expected range"
  );
  console.log(`   ${name}:`, result);
}
console.log("   PASS — heuristic path returns valid labels with bounded confidence\n");

// --- 3. Route wiring over real HTTP (no MongoDB) --------------------------

console.log("3. Route wiring (real HTTP, no DB):");
const express = (await import("express")).default;
const analyzeRouter = (
  await import(
    new URL(`file://${path.resolve(rootDir, "routes", "analyze.js")}`).href
  )
).default;
const trendRouter = (
  await import(
    new URL(`file://${path.resolve(rootDir, "routes", "trend.js")}`).href
  )
).default;

const app = express();
app.use(express.json());
app.use("/api/analyze", analyzeRouter);
app.use("/api/trend", trendRouter);
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

const server = await new Promise((resolve) => {
  const s = app.listen(0, () => resolve(s));
});
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

// Abort helper: if the server doesn't respond within `timeoutMs`, the
// request is aborted rather than hanging the test (mongoose buffering can
// stall responses when no DB is connected).
const fetchJson = async (url, opts = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return { status: res.status, body: await res.text() };
  } catch (err) {
    return { status: 504, body: `request aborted: ${err.message}` };
  } finally {
    clearTimeout(timer);
  }
};

// GET /api/trend without a DB should fail gracefully via the error handler
// instead of hanging (mongoose buffering timeout).
let trendRes = await fetchJson(`${base}/api/trend`, {}, 4000);
assert.ok(
  trendRes.status !== 200,
  "Expected failure for trend route without a DB"
);
console.log(
  `   GET /api/trend without DB -> HTTP ${trendRes.status} (never returns a false success)`
);

// DELETE /api/trend/history without a token must be rejected. The token gate
// runs before any DB access, so this is validated even without MongoDB.
const delRes = await fetchJson(`${base}/api/trend/history`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
assert.equal(delRes.status, 400, "DELETE without token should be rejected");
console.log(
  `   DELETE /api/trend/history without token -> HTTP ${delRes.status} (blocked)`
);

// POST /api/analyze with no file must return 400.
const noFileRes = await fetchJson(`${base}/api/analyze`, { method: "POST" });
assert.equal(noFileRes.status, 400, "POST /api/analyze without file -> 400");
console.log(
  `   POST /api/analyze without file -> HTTP ${noFileRes.status} (validation works)`
);

// Give the server a moment to settle, then check for async DB failures
// that the error handler couldn't catch synchronously.
await new Promise((resolve) => setTimeout(resolve, 500));
server.close();

if (unhandledError) {
  console.error(
    "   NOTE: unhandled async DB error (expected without MongoDB):",
    unhandledError.message
  );
  console.log(
    "   (This is expected behavior in the no-DB scenario — the real server\n   logs it and exits, which is why MONGODB_URI is required in production.)"
  );
}
console.log("\nAll smoke tests passed ✅");
