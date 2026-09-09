export const DEFAULT_TIME_ZONE = "UTC";
export const TIME_ZONE_COOKIE = "streakx-time-zone";

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(value: unknown) {
  return isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

function partsAt(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export function zonedDateKey(date: Date, timeZone: string) {
  const { year, month, day } = partsAt(date, normalizeTimeZone(timeZone));
  return `${year}-${month}-${day}`;
}

export function zonedMinutes(date: Date, timeZone: string) {
  const { hour, minute } = partsAt(date, normalizeTimeZone(timeZone));
  return Number(hour) * 60 + Number(minute);
}

export type AutoSyncSlot = "midday" | "end_of_day";

export function dueAutoSyncSlot(date: Date, timeZone: string): AutoSyncSlot | null {
  const minutes = zonedMinutes(date, timeZone);
  // A scheduler running every 15 minutes gets a five-minute grace period.
  if (minutes >= 12 * 60 && minutes < 12 * 60 + 20) return "midday";
  if (minutes >= 23 * 60 + 45 && minutes < 24 * 60) return "end_of_day";
  return null;
}

export function formatTimeZoneName(timeZone: string) {
  return normalizeTimeZone(timeZone).replaceAll("_", " ");
}
