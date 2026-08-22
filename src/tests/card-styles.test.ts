import { test } from "node:test";
import assert from "node:assert/strict";
import { CARD_STYLES, DEFAULT_CARD_STYLE, getCardStyle } from "../lib/card-styles";

test("CARD_STYLES has exactly the six specified presets", () => {
  const keys = CARD_STYLES.map((s) => s.key).sort();
  assert.deepEqual(keys, ["clean-dark", "hot-pink", "midnight", "purple-neon", "royal-gold", "vip"].sort());
});

test("every preset carries usable colors", () => {
  for (const style of CARD_STYLES) {
    assert.match(style.accent, /^#[0-9a-f]{6}$/i);
    assert.match(style.accent2, /^#[0-9a-f]{6}$/i);
    assert.match(style.glow, /^#[0-9a-f]{6}$/i);
  }
});

test("getCardStyle resolves a known key", () => {
  const style = getCardStyle("hot-pink");
  assert.equal(style.key, "hot-pink");
});

test("getCardStyle falls back to the default style for unknown/missing keys", () => {
  assert.equal(getCardStyle("does-not-exist").key, CARD_STYLES[0].key);
  assert.equal(getCardStyle(null).key, CARD_STYLES[0].key);
  assert.equal(getCardStyle(undefined).key, CARD_STYLES[0].key);
});

test("DEFAULT_CARD_STYLE points at a real preset", () => {
  assert.ok(CARD_STYLES.some((s) => s.key === DEFAULT_CARD_STYLE));
});
