import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/timezone.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const timezone = {};
vm.runInNewContext(compiled, { exports: timezone, Intl, Date, Object, Number }, { filename: "lib/timezone.ts" });

test("the same instant belongs to each user's real local day", () => {
  const instant = new Date("2026-09-09T01:00:00Z");
  assert.equal(timezone.zonedDateKey(instant, "America/Los_Angeles"), "2026-09-08");
  assert.equal(timezone.zonedDateKey(instant, "Asia/Karachi"), "2026-09-09");
  assert.equal(timezone.zonedDateKey(instant, "Pacific/Kiritimati"), "2026-09-09");
});

test("automatic sync windows follow local noon and end of day", () => {
  assert.equal(timezone.dueAutoSyncSlot(new Date("2026-09-09T07:05:00Z"), "Asia/Karachi"), "midday");
  assert.equal(timezone.dueAutoSyncSlot(new Date("2026-09-09T18:48:00Z"), "Asia/Karachi"), "end_of_day");
  assert.equal(timezone.dueAutoSyncSlot(new Date("2026-09-09T08:00:00Z"), "Asia/Karachi"), null);
  assert.equal(timezone.dueAutoSyncSlot(new Date("2026-07-01T19:05:00Z"), "America/Los_Angeles"), "midday");
});

test("automatic sync distributes users across each local window", () => {
  const middayMinutes = new Set();
  const endOfDayMinutes = new Set();

  for (let index = 0; index < 200; index++) {
    const userId = `user-${index}`;
    const midday = timezone.assignedAutoSyncMinute(userId, "midday");
    const endOfDay = timezone.assignedAutoSyncMinute(userId, "end_of_day");
    assert.ok(midday >= 720 && midday <= 739);
    assert.ok(endOfDay >= 1425 && endOfDay <= 1439);
    assert.equal(midday, timezone.assignedAutoSyncMinute(userId, "midday"));
    middayMinutes.add(midday);
    endOfDayMinutes.add(endOfDay);
  }

  assert.equal(middayMinutes.size, 20);
  assert.equal(endOfDayMinutes.size, 15);
});

test("a user becomes eligible at their assigned minute and remains retryable", () => {
  const userId = "82e3dcb1-970b-4b2c-b82b-46a779aea7ba";
  const assignedMinute = timezone.assignedAutoSyncMinute(userId, "midday");
  const before = new Date(`2026-09-09T${String(Math.floor((assignedMinute - 300 - 1) / 60)).padStart(2, "0")}:${String((assignedMinute - 301) % 60).padStart(2, "0")}:00Z`);
  const assigned = new Date(`2026-09-09T${String(Math.floor((assignedMinute - 300) / 60)).padStart(2, "0")}:${String((assignedMinute - 300) % 60).padStart(2, "0")}:00Z`);

  assert.equal(timezone.dueAutoSyncSlotForUser(before, "Asia/Karachi", userId), null);
  assert.equal(timezone.dueAutoSyncSlotForUser(assigned, "Asia/Karachi", userId), "midday");
  assert.equal(timezone.dueAutoSyncSlotForUser(new Date("2026-09-09T07:19:00Z"), "Asia/Karachi", userId), "midday");
});

test("invalid time zones safely fall back to UTC", () => {
  assert.equal(timezone.normalizeTimeZone("Not/A_Zone"), "UTC");
  assert.equal(timezone.zonedDateKey(new Date("2026-09-09T23:30:00Z"), "Not/A_Zone"), "2026-09-09");
});

test("X activity is counted inside the user's local date boundary", async () => {
  const activitySource = fs.readFileSync(new URL("../lib/x/getDailyProgress.ts", import.meta.url), "utf8");
  const activityCompiled = ts.transpileModule(activitySource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const activity = {};
  const fetch = async () => ({
    ok: true,
    json: async () => ({
      data: {
        tweets: [
          { createdAt: "2026-09-09T04:00:00Z", isReply: false },
          { createdAt: "2026-09-08T20:00:00Z", isReply: true },
          { createdAt: "2026-09-08T18:00:00Z", isReply: false },
        ],
      },
      has_next_page: false,
    }),
  });
  vm.runInNewContext(activityCompiled, {
    exports: activity,
    require: (name) => {
      if (name === "@/lib/timezone") return timezone;
      if (name === "@/lib/x/errors") return {
        XApiError: class XApiError extends Error {},
        normalizeXApiError: (error) => error,
        xApiErrorFromStatus: () => new Error("provider error"),
      };
      if (name === "@/lib/x/rateLimit") return { waitForXApiSlot: async () => {} };
      throw new Error("Unexpected dependency: " + name);
    },
    process: { env: { TWITTER_API_IO_KEY: "test-only" } },
    fetch,
    URL,
    Date,
    Number,
    AbortSignal,
    console,
  }, { filename: "lib/x/getDailyProgress.ts" });

  const progress = await activity.getDailyProgress("creator", "Asia/Karachi", "2026-09-09");
  assert.equal(progress.posts, 1);
  assert.equal(progress.replies, 1);
});
