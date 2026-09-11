import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadSubscriptionModule() {
  const source = fs.readFileSync(new URL("../lib/billing/subscription.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const cjsModule = { exports: {} };
  vm.runInNewContext(compiled, { module: cjsModule, exports: cjsModule.exports }, { filename: "subscription.js" });
  return cjsModule.exports;
}

const { subscriptionHasAccess } = loadSubscriptionModule();
const now = new Date("2026-09-11T12:00:00.000Z");

test("active subscription and free trial grant product access", () => {
  assert.equal(subscriptionHasAccess({ status: "active", current_period_end: null }, now), true);
  assert.equal(subscriptionHasAccess({ status: "trialing", current_period_end: null }, now), true);
  assert.equal(subscriptionHasAccess({ status: "scheduled_cancel", current_period_end: "2026-10-11T12:00:00.000Z" }, now), true);
});

test("canceled and past-due subscriptions retain paid access only through period end", () => {
  assert.equal(subscriptionHasAccess({ status: "canceled", current_period_end: "2026-09-12T12:00:00.000Z" }, now), true);
  assert.equal(subscriptionHasAccess({ status: "past_due", current_period_end: "2026-09-12T12:00:00.000Z" }, now), true);
  assert.equal(subscriptionHasAccess({ status: "canceled", current_period_end: "2026-09-10T12:00:00.000Z" }, now), false);
  assert.equal(subscriptionHasAccess({ status: "past_due", current_period_end: null }, now), false);
});

test("inactive billing states never grant access", () => {
  for (const status of ["unpaid", "expired", "paused", "pending"]) {
    assert.equal(subscriptionHasAccess({ status, current_period_end: "2026-10-11T12:00:00.000Z" }, now), false);
  }
  assert.equal(subscriptionHasAccess(null, now), false);
});
