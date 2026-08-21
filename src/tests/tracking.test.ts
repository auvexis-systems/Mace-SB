import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDeviceType, hashIp } from "../lib/tracking";

test("detectDeviceType recognizes mobile user agents", () => {
  assert.equal(
    detectDeviceType(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
    ),
    "MOBILE"
  );
});

test("detectDeviceType recognizes tablet user agents", () => {
  assert.equal(
    detectDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15"),
    "TABLET"
  );
});

test("detectDeviceType recognizes desktop user agents", () => {
  assert.equal(
    detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0"),
    "DESKTOP"
  );
});

test("detectDeviceType falls back to UNKNOWN", () => {
  assert.equal(detectDeviceType(null), "UNKNOWN");
  assert.equal(detectDeviceType("SomeBotCrawler/1.0"), "UNKNOWN");
});

test("hashIp never returns the raw IP and is deterministic", () => {
  process.env.SESSION_SECRET ||= "test-secret-for-unit-tests-only-not-prod";
  const hashed = hashIp("203.0.113.42");
  assert.notEqual(hashed, "203.0.113.42");
  assert.equal(hashed, hashIp("203.0.113.42"));
  assert.equal(hashIp(null), null);
});
