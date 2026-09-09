export type XApiErrorCode = "configuration" | "unauthorized" | "not_found" | "rate_limited" | "timeout" | "outage" | "invalid_response";

export class XApiError extends Error {
  constructor(public code: XApiErrorCode, message = code) {
    super(message);
    this.name = "XApiError";
  }
}

export function xApiErrorFromStatus(status: number) {
  if (status === 401 || status === 403) return new XApiError("unauthorized");
  if (status === 400 || status === 404 || status === 422) return new XApiError("not_found");
  if (status === 429) return new XApiError("rate_limited");
  return new XApiError("outage");
}

export function normalizeXApiError(error: unknown) {
  if (error instanceof XApiError) return error;
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return new XApiError("timeout");
  }
  return new XApiError("outage");
}

export function xConnectionErrorMessage(error: unknown) {
  switch (normalizeXApiError(error).code) {
    case "not_found": return "We couldn’t find that X account. Check the handle and try again.";
    case "rate_limited": return "X account lookup is busy right now. Wait a few minutes and try again.";
    case "configuration":
    case "unauthorized": return "X connection is temporarily unavailable because the service needs attention.";
    case "timeout": return "X took too long to respond. Check your connection and try again.";
    case "invalid_response": return "X returned an incomplete account record. Try again later.";
    default: return "We couldn’t reach X. Your account was not changed. Try again in a moment.";
  }
}

export function xRefreshErrorMessage(error: unknown, username: string) {
  switch (normalizeXApiError(error).code) {
    case "not_found": return `We can’t find @${username} on X anymore. Reconnect the account in Settings.`;
    case "rate_limited": return "X is limiting activity checks right now. No refresh was used—try again in a few minutes.";
    case "configuration":
    case "unauthorized": return "Activity tracking is temporarily unavailable because the X connection needs attention.";
    case "timeout": return "X took too long to respond. No refresh was used—check your connection and try again.";
    case "invalid_response": return "X returned activity we couldn’t read. No refresh was used—try again later.";
    default: return "X activity is temporarily unavailable. No refresh was used—try again in a moment.";
  }
}
