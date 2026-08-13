/**
 * Module register hook for the smoke test.
 *
 * Intercepts imports of `utils/classify.js` and replaces the real Anthropic
 * classifier with a deterministic stub, so the smoke test can exercise the
 * AI path without a live ANTHROPIC_API_KEY.
 */

const STUB_RESULT = {
  label: "Wet",
  confidence: 0.92,
  reasoning: "Stub: standing water and strong reflections",
};

export function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith("/utils/classify.js") || specifier === "classify.js") {
    return nextResolve(specifier, context);
  }
  return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
  if (url.endsWith("/utils/classify.js")) {
    return {
      format: "module",
      shortCircuit: true,
      source: `export async function classifyWithAI(imageBuffer, mediaType) { return ${JSON.stringify(STUB_RESULT)}; }`,
    };
  }
  return nextLoad(url, context);
}
