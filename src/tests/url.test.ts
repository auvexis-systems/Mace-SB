import { test } from "node:test";
import assert from "node:assert/strict";
import { isSafeUrl, safeUrlOrNull } from "../lib/url";

test("isSafeUrl accepts http and https URLs", () => {
  assert.equal(isSafeUrl("https://example.com"), true);
  assert.equal(isSafeUrl("http://example.com/path?x=1"), true);
});

test("isSafeUrl accepts mailto URLs", () => {
  assert.equal(isSafeUrl("mailto:test@example.com"), true);
});

test("isSafeUrl rejects dangerous schemes", () => {
  assert.equal(isSafeUrl("javascript:alert(1)"), false);
  assert.equal(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
  assert.equal(isSafeUrl("vbscript:msgbox(1)"), false);
  assert.equal(isSafeUrl("file:///etc/passwd"), false);
});

test("isSafeUrl rejects malformed input", () => {
  assert.equal(isSafeUrl(""), false);
  assert.equal(isSafeUrl("not a url"), false);
});

test("safeUrlOrNull returns null for unsafe or missing URLs", () => {
  assert.equal(safeUrlOrNull(null), null);
  assert.equal(safeUrlOrNull(undefined), null);
  assert.equal(safeUrlOrNull("javascript:alert(1)"), null);
  assert.equal(safeUrlOrNull("https://example.com"), "https://example.com");
});
