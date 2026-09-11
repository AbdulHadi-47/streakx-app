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

const AUTO_SYNC_WINDOWS = {
  midday: { start: 12 * 60, duration: 20 },
  end_of_day: { start: 23 * 60 + 45, duration: 15 },
} as const satisfies Record<AutoSyncSlot, { start: number; duration: number }>;

export function dueAutoSyncSlot(date: Date, timeZone: string): AutoSyncSlot | null {
  const minutes = zonedMinutes(date, timeZone);
  if (minutes >= AUTO_SYNC_WINDOWS.midday.start && minutes < AUTO_SYNC_WINDOWS.midday.start + AUTO_SYNC_WINDOWS.midday.duration) return "midday";
  if (minutes >= AUTO_SYNC_WINDOWS.end_of_day.start && minutes < AUTO_SYNC_WINDOWS.end_of_day.start + AUTO_SYNC_WINDOWS.end_of_day.duration) return "end_of_day";
  return null;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function assignedAutoSyncMinute(userId: string, slot: AutoSyncSlot) {
  const window = AUTO_SYNC_WINDOWS[slot];
  return window.start + stableHash(`${slot}:${userId}`) % window.duration;
}

export function dueAutoSyncSlotForUser(date: Date, timeZone: string, userId: string): AutoSyncSlot | null {
  const slot = dueAutoSyncSlot(date, timeZone);
  if (!slot) return null;

  // Once a user's assigned minute arrives, keep them eligible for the rest of
  // the window so a failed or interrupted run can retry safely.
  return zonedMinutes(date, timeZone) >= assignedAutoSyncMinute(userId, slot) ? slot : null;
}

export function formatTimeZoneName(timeZone: string) {
  return normalizeTimeZone(timeZone).replaceAll("_", " ");
}
