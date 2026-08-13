import fs from "fs";
import path from "path";

const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV
);

function resolveUploadsDir() {
  if (process.env.UPLOADS_DIR) {
    return path.resolve(process.env.UPLOADS_DIR);
  }

  if (isServerlessRuntime) {
    const tmpRoot = process.env.TMPDIR || process.env.TEMP || "/tmp";
    return path.join(tmpRoot, "track-condition-detector", "uploads");
  }

  return path.resolve("uploads");
}

export function getUploadsDir() {
  return resolveUploadsDir();
}

export function ensureUploadsDir() {
  const uploadsDir = resolveUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}
