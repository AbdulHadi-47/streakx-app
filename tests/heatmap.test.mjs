import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";

function loadModule(path, dependencies = {}) {
  const source = fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const { shiftDate, activityLevel, activityValue, buildHeatmap, describeDay } = loadModule("lib/activity/heatmap.ts");

test("UTC date arithmetic crosses leap days and year boundaries", () => {
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
  assert.equal(shiftDate("2025-03-01", -1), "2025-02-28");
  assert.equal(shiftDate("2026-01-01", -1), "2025-12-31");
  assert.equal(shiftDate("2026-03-08", 1), "2026-03-09");
});

test("every range contains exactly its real days in the correct weekday rows", () => {
  for (const today of ["2026-01-01", "2026-09-09", "2024-03-01", "2026-09-12"]) {
    for (const range of [90, 180, 365]) {
      const calendar = buildHeatmap([], today, range);
      const dates = calendar.weeks.flat().filter(Boolean).map((day) => day.date);
      assert.equal(dates.length, range);
      assert.equal(new Set(dates).size, range);
      assert.equal(dates[0], shiftDate(today, 1 - range));
      assert.equal(dates.at(-1), today);
      calendar.weeks.forEach((week) => {
        assert.equal(week.length, 7);
        week.forEach((day, row) => {
          if (day) assert.equal(new Date(`${day.date}T00:00:00Z`).getUTCDay(), row);
        });
      });
      for (let i = 1; i < dates.length; i++) assert.equal(dates[i], shiftDate(dates[i - 1], 1));
    }
  }
});

test("month labels handle a month starting inside the first partial week", () => {
  // The 90-day range starts on March 29, and April 1 is in that same week.
  const calendar = buildHeatmap([], "2026-06-26", 90);
  assert.equal(calendar.start, "2026-03-29");
  assert.equal(calendar.months[0].label, "Apr");
  assert.equal(calendar.months[0].column, 0);
  assert.ok(calendar.months.some((month) => month.label === "May"));
  assert.ok(calendar.months.some((month) => month.label === "Jun"));
});

test("missing data is distinct from a saved zero, and counts respect the range", () => {
  const calendar = buildHeatmap([
    { date: "2026-09-09", posts_count: 3, replies_count: 10, goal_completed: true },
    { date: "2026-09-08", posts_count: 0, replies_count: 0, goal_completed: false },
    { date: "2026-09-06", posts_count: 1, replies_count: 2, goal_completed: false },
    { date: "2026-09-10", posts_count: 100, replies_count: 100, goal_completed: true },
    { date: "2025-01-01", posts_count: 100, replies_count: 100, goal_completed: true },
  ], "2026-09-09", 90);
  assert.equal(calendar.summary.posts, 4);
  assert.equal(calendar.summary.replies, 12);
  assert.equal(calendar.summary.activeDays, 2);
  assert.equal(calendar.summary.completedDays, 1);
  assert.equal(calendar.summary.recordedDays, 3);
  const zero = calendar.days.find((day) => day.date === "2026-09-08");
  const missing = calendar.days.find((day) => day.date === "2026-09-07");
  assert.equal(zero.recorded, true);
  assert.equal(missing.recorded, false);
  assert.match(describeDay(zero), /0 posts, 0 replies/);
  assert.match(describeDay(missing), /No saved activity/);
});

test("metric filters and color thresholds remain consistent", () => {
  const day = { date: "2026-09-09", posts: 3, replies: 10, completed: true, recorded: true };
  assert.equal(activityValue(day, "all"), 13);
  assert.equal(activityValue(day, "posts"), 3);
  assert.equal(activityValue(day, "replies"), 10);
  for (const [count, level] of [[0, 0], [1, 1], [4, 1], [5, 2], [9, 2], [10, 3], [19, 3], [20, 4], [150, 4]]) {
    assert.equal(activityLevel(count), level);
  }
  assert.match(describeDay(day), /Both goals completed/);
});

test("changing ranges and refreshing rows updates totals without historical goal assumptions", () => {
  const old = { date: "2026-01-01", posts_count: 1, replies_count: 1, goal_completed: true };
  const today = { date: "2026-09-09", posts_count: 3, replies_count: 10, goal_completed: true };
  assert.equal(buildHeatmap([old], today.date, 90).summary.completedDays, 0);
  assert.equal(buildHeatmap([old], today.date, 365).summary.completedDays, 1);
  const refreshed = buildHeatmap([old, today], today.date, 365);
  assert.equal(refreshed.summary.completedDays, 2);
  assert.equal(refreshed.summary.posts, 4);
});

test("history queries only the signed-in user's bounded date range", async () => {
  const calls = [];
  const rows = [{ date: "2026-09-09", posts_count: 3, replies_count: 10, goal_completed: true }];
  const query = {};
  for (const method of ["select", "eq", "gte", "lte", "order"]) {
    query[method] = (...args) => { calls.push([method, ...args]); return query; };
  }
  query.limit = async (value) => { calls.push(["limit", value]); return { data: rows, error: null }; };
  const historyModule = loadModule("components/ActivityHistory.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@/lib/supabase/server": { createClient: async () => ({ from: (table) => { calls.push(["from", table]); return query; } }) },
    "@/lib/activity/heatmap": { shiftDate },
    "@/components/ActivityHeatmap": { default: "heatmap" },
  });
  const result = await historyModule.default({ userId: "authenticated-user", today: "2026-09-09" });
  assert.deepEqual(calls.find(([method]) => method === "eq"), ["eq", "user_id", "authenticated-user"]);
  assert.deepEqual(calls.find(([method]) => method === "gte"), ["gte", "date", "2025-09-10"]);
  assert.deepEqual(calls.find(([method]) => method === "lte"), ["lte", "date", "2026-09-09"]);
  assert.deepEqual(calls.at(-1), ["limit", 365]);
  assert.equal(result.props.rows, rows);
});
