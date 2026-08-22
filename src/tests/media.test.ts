import { test } from "node:test";
import assert from "node:assert/strict";
import { MEDIA_CATEGORIES, MEDIA_ICON_REGISTRY, SYSTEM_MEDIA_MOTIFS } from "../lib/media";

test("MEDIA_CATEGORIES starts with an 'alle' catch-all filter", () => {
  assert.equal(MEDIA_CATEGORIES[0].key, "alle");
});

test("every system motif has a matching icon in the registry", () => {
  for (const motif of SYSTEM_MEDIA_MOTIFS) {
    assert.ok(MEDIA_ICON_REGISTRY[motif.iconKey], `missing icon for ${motif.iconKey}`);
  }
});

test("there are exactly the nine curated motifs from the spec", () => {
  assert.equal(SYSTEM_MEDIA_MOTIFS.length, 9);
  const names = SYSTEM_MEDIA_MOTIFS.map((m) => m.name).sort();
  assert.deepEqual(
    names,
    ["777", "Crown", "Dice", "Jackpot", "Playing Cards", "Poker Chips", "Roulette", "Trophy", "VIP"].sort()
  );
});

test("every motif's category exists in MEDIA_CATEGORIES", () => {
  const validCategories = new Set(MEDIA_CATEGORIES.map((c) => c.key));
  for (const motif of SYSTEM_MEDIA_MOTIFS) {
    assert.ok(validCategories.has(motif.category), `unknown category ${motif.category}`);
  }
});
