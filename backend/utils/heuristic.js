import sharp from "sharp";

/**
 * Fast, free, local first-pass classifier based on image brightness stats.
 * Not as accurate as the AI vision model, but has zero latency/cost, so it's
 * useful as a fallback when the API is unavailable, rate-limited, or you
 * just want a quick local guess before spending an API call.
 *
 * Heuristic logic:
 * - Wet surfaces have bright specular highlights -> high max brightness + high variance
 * - Damp surfaces are darker overall with moderate variance (no bright highlights)
 * - Dry surfaces are more uniform -> low variance
 * - Drying surfaces sit in between damp and dry on variance
 *
 * @param {Buffer} imageBuffer
 * @returns {Promise<{label: string, confidence: number, reasoning: string}>}
 */
export async function classifyWithHeuristic(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .resize(200, 200, { fit: "inside" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data);
  const n = pixels.length;

  const mean = pixels.reduce((sum, v) => sum + v, 0) / n;
  const variance =
    pixels.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const maxVal = Math.max(...pixels);

  // Fraction of pixels that are near-white (specular highlight proxy)
  const brightPixelRatio =
    pixels.filter((v) => v > 220).length / n;

  let label;
  let reasoning;

  if (brightPixelRatio > 0.03 && maxVal > 240) {
    label = "Wet";
    reasoning = "Bright specular highlights suggest standing water";
  } else if (stdDev > 45) {
    label = "Drying";
    reasoning = "High brightness variance suggests patchy drying surface";
  } else if (mean < 100 && stdDev > 25) {
    label = "Damp";
    reasoning = "Darker, moderately uneven surface without bright highlights";
  } else {
    label = "Dry";
    reasoning = "Uniform brightness with no reflections detected";
  }

  // Heuristic confidence is intentionally capped lower than the AI path,
  // since this is a much cruder signal.
  const confidence = 0.55;

  return { label, confidence, reasoning, info };
}
