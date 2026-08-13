export function asText(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object" && typeof value.message === "string") {
    return value.message;
  }
  return fallback;
}

export function extractErrorMessage(err, fallback = "Something went wrong") {
  const apiError = err?.response?.data?.error;
  const apiMessage = err?.response?.data?.message;
  return (
    asText(apiError) ||
    asText(apiMessage) ||
    asText(err?.message) ||
    fallback
  );
}
