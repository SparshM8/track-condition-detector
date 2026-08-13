import ffmpeg from "fluent-ffmpeg";
import { createRequire } from "node:module";
import path from "path";
import fs from "fs";

// ffmpeg-static is a CommonJS module. On some runtimes (e.g. Vercel Node 22),
// the ESM default import resolves to undefined and ffmpeg.setFfmpegPath gets
// an undefined path, crashing every serverless invocation at module load time.
// Load it through createRequire for reliable resolution.
const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Extract frames from a video file at a fixed interval (frames per second).
 * Frames are written as JPGs into outputDir, named frame-0001.jpg, frame-0002.jpg, ...
 *
 * @param {string} videoPath - path to the uploaded video file
 * @param {string} outputDir - directory to write extracted frames into
 * @param {number} fps - how many frames to extract per second of video (e.g. 0.5 = one frame every 2s)
 * @returns {Promise<string[]>} - sorted array of absolute frame file paths
 */
export function extractFrames(videoPath, outputDir, fps = 0.5) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([`-vf fps=${fps}`])
      .output(path.join(outputDir, "frame-%04d.jpg"))
      .on("end", () => {
        const files = fs
          .readdirSync(outputDir)
          .filter((f) => f.startsWith("frame-") && f.endsWith(".jpg"))
          .sort()
          .map((f) => path.join(outputDir, f));
        resolve(files);
      })
      .on("error", (err) => reject(err))
      .run();
  });
}
