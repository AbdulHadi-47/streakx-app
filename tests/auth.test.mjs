import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createServerClient } from "@supabase/ssr";

function moduleFrom(file, dependencies, globals = {}) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  return exports;
}

function authActions(auth) {
  const events = [];
  const actions = moduleFrom("app/actions/auth.ts", {
    "@/lib/supabase/server": {
      createClient: async (options) => {
        assert.equal(options.writableCookies, true);
        return { auth };
      },
    },
    "@/lib/site-url": { getSiteUrl: async () => "http://localhost:3000" },
    "next/cache": { revalidatePath: () => events.push("invalidate") },
    "next/headers": { headers: async () => ({ get: () => "http://localhost:3000" }) },
    "next/navigation": { redirect: (url) => { events.push(url); throw new Error(`REDIRECT:${url}`); } },
  }, { process: { env: {} } });
  return { ...actions, events };
}

function loginForm() {
  const data = new FormData();
  data.set("email", " creator@example.invalid ");
  data.set("password", " password-with-spaces ");
  return data;
}

test("successful login persists a session before invalidation and dashboard redirect", async () => {
  const actions = authActions({ signInWithPassword: async (credentials) => {
    assert.equal(credentials.email, "creator@example.invalid");
    assert.equal(credentials.password, " password-with-spaces ");
    actions.events.push("session-created");
    return { data: { session: { access_token: "test" } }, error: null };
  } });
  await assert.rejects(actions.signIn({}, loginForm()), /REDIRECT:\/dashboard/);
  assert.deepEqual(actions.events, ["session-created", "invalidate", "/dashboard"]);
});

test("rejected passwords and unconfirmed emails preserve the email and explain the failure", async () => {
  for (const [code, expected] of [["invalid_credentials", /don’t match/], ["email_not_confirmed", /confirm your email/]]) {
    const actions = authActions({ signInWithPassword: async () => ({ data: {}, error: { code, status: 400, message: "provider error" } }) });
    const state = await actions.signIn({}, loginForm());
    assert.equal(state.success, false);
    assert.equal(state.email, "creator@example.invalid");
    assert.match(state.message, expected);
    assert.equal(actions.events.length, 0);
    assert.equal("password" in state, false);
  }
});

test("missing sessions and service failures cannot look like successful logins", async () => {
  for (const signInWithPassword of [
    async () => ({ data: { session: null }, error: null }),
    async () => { throw new Error("network unavailable"); },
  ]) {
    const actions = authActions({ signInWithPassword });
    const state = await actions.signIn({}, loginForm());
    assert.equal(state.success, false);
    assert.ok(state.message);
    assert.equal(actions.events.length, 0);
  }
});

test("signup requiring email confirmation stays on the form with instructions", async () => {
  let request;
  const actions = authActions({ signUp: async (payload) => {
    request = payload;
    return { data: { session: null }, error: null };
  } });
  const state = await actions.signUp({}, loginForm());
  assert.equal(state.success, true);
  assert.match(state.message, /confirm your email/);
  assert.match(state.message, /automatically/);
  assert.equal(request.options.emailRedirectTo, "http://localhost:3000/auth/callback?next=/subscribe");
  assert.equal(actions.events.length, 0);
});

test("password recovery uses the app callback and avoids account enumeration", async () => {
  let request;
  const actions = authActions({
    resetPasswordForEmail: async (email, options) => {
      request = { email, options };
      return { error: null };
    },
  });
  const data = new FormData();
  data.set("email", " Creator@Example.invalid ");
  const state = await actions.requestPasswordReset({}, data);
  assert.equal(state.success, true);
  assert.equal(request.email, "creator@example.invalid");
  assert.equal(request.options.redirectTo, "http://localhost:3000/auth/callback?next=/reset-password");
  assert.match(state.message, /If an account exists/);
});

test("expired-link replacement sends a fresh signup confirmation", async () => {
  let request;
  const actions = authActions({
    resend: async (payload) => {
      request = payload;
      return { error: null };
    },
  });
  const data = new FormData();
  data.set("email", "creator@example.invalid");
  assert.equal((await actions.resendConfirmation({}, data)).success, true);
  assert.equal(request.type, "signup");
  assert.match(request.options.emailRedirectTo, /\/auth\/callback/);
  assert.match(request.options.emailRedirectTo, /next=\/subscribe/);
});

test("recovered passwords require a live recovery session", async () => {
  const data = new FormData();
  data.set("password", "new-password");
  data.set("password_confirmation", "new-password");
  const actions = authActions({
    getUser: async () => ({ data: { user: null } }),
  });
  const state = await actions.updateRecoveredPassword({}, data);
  assert.equal(state.success, false);
  assert.match(state.message, /expired/);
});

test("real Supabase SSR cookies survive a new server request", async () => {
  const jar = new Map();
  const user = { id: "11111111-1111-4111-8111-111111111111", email: "creator@example.invalid", aud: "authenticated", role: "authenticated" };
  const accessToken = [
    { alg: "HS256", typ: "JWT" },
    { sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, aud: "authenticated" },
  ].map((part) => Buffer.from(JSON.stringify(part)).toString("base64url")).join(".") + ".fixture";
  const requests = [];
  const server = moduleFrom("lib/supabase/server.ts", {
    "@supabase/ssr": { createServerClient },
    "next/headers": { cookies: async () => ({
      getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
      set: (name, value) => jar.set(name, value),
    }) },
  }, {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-key" } },
    AbortSignal,
    fetch: async (input, init) => {
      const url = String(input);
      requests.push(url);
      assert.ok(init.signal);
      // Provider boundaries are fixtures. No live credentials or accounts.
      if (url.includes("/token?")) return Response.json({ access_token: accessToken, refresh_token: "fixture-refresh", expires_in: 3600, token_type: "bearer", user });
      if (url.endsWith("/user")) return Response.json(user);
      throw new Error(`Unexpected auth request: ${url}`);
    },
  });
  const firstRequest = await server.createClient({ writableCookies: true });
  const { error } = await firstRequest.auth.signInWithPassword({ email: user.email, password: "fixture-password" });
  assert.equal(error, null);
  assert.ok([...jar.keys()].some((name) => name.includes("auth-token")));
  const secondRequest = await server.createClient();
  const result = await secondRequest.auth.getUser();
  assert.equal(result.error, null);
  assert.equal(result.data.user.id, user.id);
  assert.equal(requests.length, 2);
});
