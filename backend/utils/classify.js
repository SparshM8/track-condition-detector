// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Change this if Google releases a newer vision-capable model you'd rather use.
// const MODEL = "gemini-2.0-flash";

// const SYSTEM_PROMPT = `You are a racetrack surface analyst. You look at a single photo of a
// race track surface and classify its condition. Use these visual cues:

// - Wet: standing water, puddles, strong specular reflections, glossy uniform sheen
// - Damp: dark patchy sheen, no standing water, surface looks recently wet but not glossy
// - Drying: streaky patterns, mix of dry and wet patches, uneven color, visible drying edges
// - Dry: matte, uniform surface color, no reflections or dark patches

// Respond with ONLY a JSON object, no other text, no markdown fences:
// {"label": "Dry" | "Damp" | "Wet" | "Drying", "confidence": 0.0-1.0, "reasoning": "one short sentence"}`;

// /**
//  * Classify a track image using Gemini's vision capability.
//  * @param {Buffer} imageBuffer - raw image bytes
//  * @param {string} mediaType - e.g. "image/jpeg", "image/png"
//  * @returns {Promise<{label: string, confidence: number, reasoning: string}>}
//  */
// export async function classifyWithAI(imageBuffer, mediaType) {
//   const base64Image = imageBuffer.toString("base64");

//   const model = genAI.getGenerativeModel({
//     model: MODEL,
//     systemInstruction: SYSTEM_PROMPT,
//   });

//   const result = await model.generateContent([
//     {
//       inlineData: {
//         mimeType: mediaType,
//         data: base64Image,
//       },
//     },
//     { text: "Classify this track surface image." },
//   ]);

//   const text = result.response.text();
//   if (!text) {
//     throw new Error("No text response from classification model");
//   }

//   // Strip markdown fences defensively in case the model adds them anyway.
//   const cleaned = text.replace(/```json|```/g, "").trim();
//   const parsed = JSON.parse(cleaned);

//   if (!["Dry", "Damp", "Wet", "Drying"].includes(parsed.label)) {
//     throw new Error(`Unexpected label from model: ${parsed.label}`);
//   }

//   return parsed;
// }
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Change this if Google releases a newer vision-capable model you'd rather use.
// const MODEL = "gemini-2.0-flash";

// const SYSTEM_PROMPT = `You are a racetrack surface analyst. You look at a single photo of a
// race track surface and classify its condition. Use these visual cues:

// - Wet: standing water, puddles, strong specular reflections, glossy uniform sheen
// - Damp: dark patchy sheen, no standing water, surface looks recently wet but not glossy
// - Drying: streaky patterns, mix of dry and wet patches, uneven color, visible drying edges
// - Dry: matte, uniform surface color, no reflections or dark patches

// Respond with ONLY a JSON object, no other text, no markdown fences:
// {"label": "Dry" | "Damp" | "Wet" | "Drying", "confidence": 0.0-1.0, "reasoning": "one short sentence"}`;

// /**
//  * Classify a track image using Gemini's vision capability.
//  * @param {Buffer} imageBuffer - raw image bytes
//  * @param {string} mediaType - e.g. "image/jpeg", "image/png"
//  * @returns {Promise<{label: string, confidence: number, reasoning: string}>}
//  */
// export async function classifyWithAI(imageBuffer, mediaType) {
//   const base64Image = imageBuffer.toString("base64");

//   const model = genAI.getGenerativeModel({
//     model: MODEL,
//     systemInstruction: SYSTEM_PROMPT,
//   });

//   const result = await model.generateContent([
//     {
//       inlineData: {
//         mimeType: mediaType,
//         data: base64Image,
//       },
//     },
//     { text: "Classify this track surface image." },
//   ]);

//   const text = result.response.text();
//   if (!text) {
//     throw new Error("No text response from classification model");
//   }

//   // Strip markdown fences defensively in case the model adds them anyway.
//   const cleaned = text.replace(/```json|```/g, "").trim();
//   const parsed = JSON.parse(cleaned);

//   if (!["Dry", "Damp", "Wet", "Drying"].includes(parsed.label)) {
//     throw new Error(`Unexpected label from model: ${parsed.label}`);
//   }

//   return parsed;
// }

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const MODEL = "gemini-2.5-flash";

// const SYSTEM_PROMPT = `You are a racetrack surface analyst. You look at a single photo of a
// race track or road surface and classify its condition. Use these visual cues carefully:

// - Wet: standing water, visible puddles, dark wet patches, strong LOCALIZED specular
//   reflections that clearly mirror the sky/surroundings (like a mirror on the ground)
// - Damp: dark patchy sheen, no standing water, surface looks recently wet but not glossy
// - Drying: streaky patterns, mix of dry and wet patches, uneven color, visible drying edges
// - Dry: matte or lightly glossy uniform surface color, NO standing water or mirror-like
//   reflections

// IMPORTANT — do not confuse these with wetness:
// - Sun glare, lens flare, or bright sunlight hitting the road (common on clear sunny days)
// - General road sheen from asphalt material itself (asphalt often looks slightly glossy
//   when dry, especially in bright light)
// - Heat haze/shimmer in the distance
// - Shadows or color variation from surrounding terrain, sky color, or vegetation
// A DRY road in bright sunlight can look bright or slightly reflective — this alone is NOT
// enough evidence for "Wet". Only classify as Wet/Damp if there is clear, localized,
// mirror-like reflection or visibly dark, saturated patches consistent with actual moisture.

// Respond with ONLY a JSON object, no other text, no markdown fences:
// {"label": "Dry" | "Damp" | "Wet" | "Drying", "confidence": 0.0-1.0, "reasoning": "one short sentence"}`;

// /**
//  * Classify a track image using Gemini's vision capability.
//  * @param {Buffer} imageBuffer - raw image bytes
//  * @param {string} mediaType - e.g. "image/jpeg", "image/png"
//  * @returns {Promise<{label: string, confidence: number, reasoning: string}>}
//  */
// export async function classifyWithAI(imageBuffer, mediaType) {
//   // Created lazily, inside the function call — NOT at module load time.
//   // ES module imports (including this file, via routes/analyze.js) all
//   // execute before top-level statements like dotenv.config() in server.js
//   // run, so process.env.GEMINI_API_KEY was undefined at module-load time,
//   // permanently baking an invalid key into a module-level client.
//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error("GEMINI_API_KEY is missing or not loaded from .env");
//   }
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//   const base64Image = imageBuffer.toString("base64");

//   const model = genAI.getGenerativeModel({
//     model: MODEL,
//     systemInstruction: SYSTEM_PROMPT,
//   });

//   const result = await model.generateContent([
//     {
//       inlineData: {
//         mimeType: mediaType,
//         data: base64Image,
//       },
//     },
//     { text: "Classify this track surface image." },
//   ]);

//   const text = result.response.text();
//   if (!text) {
//     throw new Error("No text response from classification model");
//   }

//   const cleaned = text.replace(/```json|```/g, "").trim();
//   const parsed = JSON.parse(cleaned);

//   if (!["Dry", "Damp", "Wet", "Drying"].includes(parsed.label)) {
//     throw new Error(`Unexpected label from model: ${parsed.label}`);
//   }

//   return parsed;
// }

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are a racetrack surface analyst. You look at a single photo of a
race track or road surface and classify its condition. Use these visual cues carefully:

- Wet: standing water, visible puddles, dark wet patches, strong LOCALIZED specular
  reflections that clearly mirror the sky/surroundings (like a mirror on the ground)
- Damp: dark patchy sheen, no standing water, surface looks recently wet but not glossy
- Drying: streaky patterns, mix of dry and wet patches, uneven color, visible drying edges
- Dry: matte or lightly glossy uniform surface color, NO standing water or mirror-like
  reflections

IMPORTANT — do not confuse these with wetness:
- Sun glare, lens flare, or bright sunlight hitting the road (common on clear sunny days)
- General road sheen from asphalt material itself (asphalt often looks slightly glossy
  when dry, especially in bright light)
- Heat haze/shimmer in the distance
- Shadows or color variation from surrounding terrain, sky color, or vegetation
A DRY road in bright sunlight can look bright or slightly reflective — this alone is NOT
enough evidence for "Wet". Only classify as Wet/Damp if there is clear, localized,
mirror-like reflection or visibly dark, saturated patches consistent with actual moisture.

Respond with ONLY a JSON object, no other text, no markdown fences:
{"label": "Dry" | "Damp" | "Wet" | "Drying", "confidence": 0.0-1.0, "reasoning": "one short sentence"}`;

/**
 * Classify a track image using Gemini's vision capability.
 * @param {Buffer} imageBuffer - raw image bytes
 * @param {string} mediaType - e.g. "image/jpeg", "image/png"
 * @returns {Promise<{label: string, confidence: number, reasoning: string}>}
 */
export async function classifyWithAI(imageBuffer, mediaType) {
  // Created lazily, inside the function call — NOT at module load time.
  // ES module imports (including this file, via routes/analyze.js) all
  // execute before top-level statements like dotenv.config() in server.js
  // run, so process.env.GEMINI_API_KEY was undefined at module-load time,
  // permanently baking an invalid key into a module-level client.
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing or not loaded from .env");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const base64Image = imageBuffer.toString("base64");

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mediaType,
        data: base64Image,
      },
    },
    { text: "Classify this track surface image." },
  ]);

  const text = result.response.text();
  if (!text) {
    throw new Error("No text response from classification model");
  }

  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!["Dry", "Damp", "Wet", "Drying"].includes(parsed.label)) {
    throw new Error(`Unexpected label from model: ${parsed.label}`);
  }

  return parsed;
}
