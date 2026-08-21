import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp, lerp, particleCountFor, parallaxRangeFor } from "../lib/motion";

test("clamp keeps values within bounds", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test("lerp interpolates and clamps t to [0,1]", () => {
  assert.equal(lerp(0, 100, 0.5), 50);
  assert.equal(lerp(0, 100, -1), 0);
  assert.equal(lerp(0, 100, 2), 100);
});

test("particleCountFor stays low and reduces further on mobile", () => {
  const desktopLow = particleCountFor("low", false);
  const desktopMedium = particleCountFor("medium", false);
  const mobileLow = particleCountFor("low", true);
  const mobileMedium = particleCountFor("medium", true);

  assert.ok(desktopMedium > desktopLow);
  assert.ok(mobileLow < desktopLow);
  assert.ok(mobileMedium < desktopMedium);
  assert.ok(desktopMedium <= 30, "particle count should stay in a lightweight range");
});

test("parallaxRangeFor scales linearly and clamps strength to 0-100", () => {
  assert.equal(parallaxRangeFor(0, 60), 0);
  assert.equal(parallaxRangeFor(100, 60), 60);
  assert.equal(parallaxRangeFor(50, 60), 30);
  assert.equal(parallaxRangeFor(-20, 60), 0);
  assert.equal(parallaxRangeFor(150, 60), 60);
});
