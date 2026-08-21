import { test } from "node:test";
import assert from "node:assert/strict";
import { cardSchema, categorySchema, loginSchema } from "../lib/validation";

test("cardSchema requires title, shortDesc and a safe ctaUrl", () => {
  const result = cardSchema.safeParse({
    title: "",
    shortDesc: "",
    ctaUrl: "javascript:alert(1)",
    tags: [],
  });
  assert.equal(result.success, false);
});

test("cardSchema accepts a minimal valid card", () => {
  const result = cardSchema.safeParse({
    title: "Demo Offer",
    shortDesc: "Kurzbeschreibung",
    ctaUrl: "https://example.com/offer",
    tags: ["demo"],
  });
  assert.equal(result.success, true);
});

test("cardSchema rejects unsafe optional second CTA URL", () => {
  const result = cardSchema.safeParse({
    title: "Demo Offer",
    shortDesc: "Kurzbeschreibung",
    ctaUrl: "https://example.com/offer",
    cta2Url: "javascript:alert(1)",
    tags: [],
  });
  assert.equal(result.success, false);
});

test("categorySchema requires a non-empty name", () => {
  assert.equal(categorySchema.safeParse({ name: "" }).success, false);
  assert.equal(categorySchema.safeParse({ name: "Neu" }).success, true);
});

test("loginSchema requires both fields", () => {
  assert.equal(loginSchema.safeParse({ identifier: "", password: "" }).success, false);
  assert.equal(
    loginSchema.safeParse({ identifier: "admin", password: "secret" }).success,
    true
  );
});
