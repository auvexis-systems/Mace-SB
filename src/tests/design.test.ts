import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDesignConfig, DEFAULT_DESIGN, designToCssVars, BUILT_IN_THEMES } from "../lib/design";

test("parseDesignConfig falls back to defaults on invalid JSON", () => {
  const result = parseDesignConfig("not json");
  assert.deepEqual(result, DEFAULT_DESIGN);
});

test("parseDesignConfig merges partial JSON with defaults", () => {
  const result = parseDesignConfig(JSON.stringify({ accentColor: "#ff0000" }));
  assert.equal(result.accentColor, "#ff0000");
  assert.equal(result.cardRadius, DEFAULT_DESIGN.cardRadius);
});

test("designToCssVars produces expected CSS custom properties", () => {
  const vars = designToCssVars(DEFAULT_DESIGN);
  assert.ok(vars["--msb-accent"]);
  assert.ok(vars["--msb-card-radius"].endsWith("px"));
  assert.ok(vars["--msb-accent-2"]);
  assert.ok(vars["--msb-featured-glow"]);
});

test("DEFAULT_DESIGN ships with the v1.1 casino/motion fields enabled", () => {
  assert.equal(DEFAULT_DESIGN.casinoBackgroundEnabled, true);
  assert.equal(DEFAULT_DESIGN.particlesEnabled, true);
  assert.ok(["low", "medium"].includes(DEFAULT_DESIGN.particleIntensity));
});

test("Clean Light preset disables the casino background", () => {
  const cleanLight = BUILT_IN_THEMES.find((t) => t.name === "Clean Light");
  assert.ok(cleanLight);
  assert.equal(cleanLight!.config.casinoBackgroundEnabled, false);
  assert.equal(cleanLight!.config.particlesEnabled, false);
});
