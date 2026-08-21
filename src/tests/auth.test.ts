import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../lib/session-token";

process.env.SESSION_SECRET ||= "test-secret-for-unit-tests-only-not-prod";

test("hashPassword never stores plaintext and verifyPassword round-trips", async () => {
  const hash = await hashPassword("Sicheres Passwort 123!");
  assert.notEqual(hash, "Sicheres Passwort 123!");
  assert.equal(await verifyPassword("Sicheres Passwort 123!", hash), true);
  assert.equal(await verifyPassword("falsches-passwort", hash), false);
});

test("session token round-trips and carries payload", async () => {
  const token = await createSessionToken({ userId: "u1", username: "admin", role: "ADMIN" });
  const payload = await verifySessionToken(token);
  assert.deepEqual(payload, { userId: "u1", username: "admin", role: "ADMIN" });
});

test("verifySessionToken rejects tampered tokens", async () => {
  const token = await createSessionToken({ userId: "u1", username: "admin", role: "ADMIN" });
  const tampered = token.slice(0, -2) + "xx";
  const payload = await verifySessionToken(tampered);
  assert.equal(payload, null);
});

test("verifySessionToken rejects garbage input", async () => {
  const payload = await verifySessionToken("not-a-jwt");
  assert.equal(payload, null);
});
