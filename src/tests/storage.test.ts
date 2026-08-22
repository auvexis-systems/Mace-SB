import { test } from "node:test";
import assert from "node:assert/strict";
import { saveUploadedImage } from "../lib/storage";

// Only the rejection paths are exercised here — they return before touching
// the filesystem, so these tests stay side-effect-free (no real files
// written into public/uploads).

test("rejects an empty file", async () => {
  const file = new File([], "empty.png", { type: "image/png" });
  const result = await saveUploadedImage(file);
  assert.ok("error" in result);
});

test("rejects a file over the 5 MB limit", async () => {
  const big = new Uint8Array(5 * 1024 * 1024 + 1);
  const file = new File([big], "big.png", { type: "image/png" });
  const result = await saveUploadedImage(file);
  assert.ok("error" in result);
  if ("error" in result) assert.match(result.error, /gross|groß|5 MB/i);
});

test("rejects an unsupported mime type", async () => {
  const file = new File([new Uint8Array([1, 2, 3])], "file.gif", { type: "image/gif" });
  const result = await saveUploadedImage(file);
  assert.ok("error" in result);
  if ("error" in result) assert.match(result.error, /Dateityp/i);
});

test("rejects a file whose content doesn't match its declared PNG type", () => {
  return (async () => {
    const fakePng = new Uint8Array([0, 0, 0, 0]); // not a real PNG signature
    const file = new File([fakePng], "fake.png", { type: "image/png" });
    const result = await saveUploadedImage(file);
    assert.ok("error" in result);
  })();
});
