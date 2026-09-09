import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real server actions with isolated service boundaries. No live
// accounts, database writes, or paid X API requests are used by these tests.
function loadAction(file, { user = { id: "test-user" }, reads = [], writeError = null, updated = { user_id: "test-user" }, fetchImpl, activity } = {}) {
  const writes = [];
  const invalidations = [];
  const database = {
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => {
      let updating = false;
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => updating
          ? { data: updated, error: writeError }
          : reads.shift() ?? { data: null, error: null },
        upsert: async (value) => { writes.push(value); return { error: writeError }; },
        update: (value) => { updating = true; writes.push(value); return query; },
      };
      return query;
    },
  };
  const getActivity = activity ?? (async () => ({ posts: 3, replies: 10 }));
  class ProgressSyncError extends Error {}
  const dependencies = {
    "@/lib/supabase/server": { createClient: async () => database },
    "next/navigation": { redirect: (url) => { throw new Error(`REDIRECT:${url}`); } },
    "next/cache": { revalidatePath: (url) => invalidations.push(url) },
    "next/headers": { cookies: async () => ({ get: () => undefined, set: () => {} }) },
    "@/lib/x/getDailyProgress": { getDailyProgress: getActivity },
    "@/lib/timezone": { normalizeTimeZone: (value) => typeof value === "string" && value ? value : "UTC" },
    "@/lib/progress/sync-progress": {
      ProgressSyncError,
      syncProgressForProfile: async (client, profile, options) => {
        const { data: existing, error } = await client.from("daily_progress").select("refresh_count").eq("user_id", profile.user_id).eq("date", "2026-09-09").maybeSingle();
        if (error) throw new Error("read failed");
        const refreshCount = existing?.refresh_count ?? 0;
        if (options?.incrementManualRefresh && refreshCount >= 3) return { success: false, reason: "limit" };
        const progress = await getActivity();
        const write = await client.from("daily_progress").upsert({
          user_id: profile.user_id,
          date: "2026-09-09",
          posts_count: progress.posts,
          replies_count: progress.replies,
          goal_completed: progress.posts >= profile.daily_post_goal && progress.replies >= profile.daily_reply_goal,
          refresh_count: options?.incrementManualRefresh ? refreshCount + 1 : refreshCount,
        });
        if (write.error) throw new Error("write failed");
        return { success: true, progress };
      },
    },
    "@/lib/x/getXAccount": {
      getXAccount: async (username) => {
        const response = await (fetchImpl ?? (async () => ({ ok: true, json: async () => ({ data: { id: "x-id", userName: username } }) })))(new URL("https://example.invalid?userName=" + username));
        if (!response.ok) throw new Error("not found");
        const result = await response.json();
        return { id: String(result.data.id), username: result.data.userName };
      },
    },
    "@/lib/x/errors": {
      xConnectionErrorMessage: () => "We couldn’t reach X. Your account was not changed.",
      xRefreshErrorMessage: () => "Could not refresh your X activity. No refresh was used.",
    },
  };
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  const context = {
    exports,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    process: { env: { TWITTER_API_IO_KEY: "test-only" } },
    URL,
    console: { error() {} },
    fetch: fetchImpl ?? (async () => ({ ok: true, json: async () => ({ data: { id: "x-id", userName: "creator" } }) })),
  };
  vm.runInNewContext(compiled, context, { filename: file });
  return { actions: exports, writes, invalidations };
}

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("goal setup requires authentication before writing", async () => {
  const { actions, writes } = loadAction("app/actions/goals.ts", { user: null });
  await assert.rejects(actions.saveGoals({}, form({ daily_post_goal: "3", daily_reply_goal: "10" })), /REDIRECT:\/login/);
  assert.equal(writes.length, 0);
});

test("invalid daily goals return a message without saving", async () => {
  for (const invalid of ["0", "-1", "1.5", "abc", "Infinity"]) {
    const { actions, writes } = loadAction("app/actions/goals.ts");
    const state = await actions.saveGoals({}, form({ daily_post_goal: invalid, daily_reply_goal: "10" }));
    assert.match(state.message, /whole number/);
    assert.equal(writes.length, 0);
  }
});

test("saved goals lead to X connection", async () => {
  const { actions, writes } = loadAction("app/actions/goals.ts");
  await assert.rejects(actions.saveGoals({}, form({ daily_post_goal: "3", daily_reply_goal: "10" })), /REDIRECT:\/connect-x/);
  assert.equal(writes[0].user_id, "test-user");
  assert.equal(writes[0].daily_post_goal, 3);
});

test("a goal save failure stays on the form", async () => {
  const { actions } = loadAction("app/actions/goals.ts", { writeError: { message: "unavailable" } });
  assert.match((await actions.saveGoals({}, form({ daily_post_goal: "3", daily_reply_goal: "10" }))).message, /couldn’t be saved/);
});

test("connecting X normalizes the handle and opens the dashboard", async () => {
  let requestedHandle;
  const { actions, writes } = loadAction("app/actions/x.ts", {
    fetchImpl: async (url) => {
      requestedHandle = url.searchParams.get("userName");
      return { ok: true, json: async () => ({ data: { id: "x-id", userName: "creator" } }) };
    },
  });
  await assert.rejects(actions.connectX({}, form({ username: "  @creator  " })), /REDIRECT:\/dashboard/);
  assert.equal(requestedHandle, "creator");
  assert.equal(writes[0].x_user_id, "x-id");
});

test("a missing profile cannot report a successful connection", async () => {
  const { actions } = loadAction("app/actions/x.ts", { updated: null });
  assert.match((await actions.connectX({}, form({ username: "creator" }))).message, /Set your daily goals/);
});

test("invalid handles and X outages produce useful inline errors", async () => {
  const { actions, writes } = loadAction("app/actions/x.ts", { fetchImpl: async () => { throw new Error("offline"); } });
  assert.match((await actions.connectX({}, form({ username: "invalid handle!" }))).message, /valid X username/);
  assert.match((await actions.connectX({}, form({ username: "creator" }))).message, /couldn’t reach X/);
  assert.equal(writes.length, 0);
});

const profile = { data: { x_username: "creator", daily_post_goal: 3, daily_reply_goal: 10, time_zone: "Asia/Karachi" } };

test("the daily refresh limit prevents another X request", async () => {
  let requests = 0;
  const { actions, writes } = loadAction("app/actions/progress.ts", {
    reads: [profile, { data: { refresh_count: 3 } }],
    activity: async () => { requests++; return { posts: 3, replies: 10 }; },
  });
  const state = await actions.refreshProgress();
  assert.equal(state.success, false);
  assert.match(state.message, /all 3 refreshes/);
  assert.equal(requests, 0);
  assert.equal(writes.length, 0);
});

test("an X refresh failure does not consume a refresh", async () => {
  const { actions, writes } = loadAction("app/actions/progress.ts", {
    reads: [profile, { data: { refresh_count: 1 } }],
    activity: async () => { throw new Error("offline"); },
  });
  assert.match((await actions.refreshProgress()).message, /Could not refresh/);
  assert.equal(writes.length, 0);
});

test("both goals must be met and successful refreshes update the dashboard", async () => {
  for (const [replies, completed] of [[9, false], [10, true]]) {
    const { actions, writes, invalidations } = loadAction("app/actions/progress.ts", {
      reads: [profile, { data: { refresh_count: 1 } }],
      activity: async () => ({ posts: 3, replies }),
    });
    assert.equal((await actions.refreshProgress()).success, true);
    assert.equal(writes[0].goal_completed, completed);
    assert.equal(writes[0].refresh_count, 2);
    assert.deepEqual(invalidations, ["/dashboard"]);
  }
});
