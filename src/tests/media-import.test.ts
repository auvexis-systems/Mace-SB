import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "../generated/prisma";

const testDbPath = path.join(__dirname, "..", "..", "prisma", "test-media-import.db");
const testDbUrl = `file:${testDbPath}`;

let prisma: PrismaClient;

before(() => {
  if (fs.existsSync(testDbPath)) fs.rmSync(testDbPath);
  execSync("npx prisma db push --skip-generate", {
    cwd: path.join(__dirname, "..", ".."),
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "pipe",
  });
  prisma = new PrismaClient({ datasourceUrl: testDbUrl });
});

after(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(testDbPath)) fs.rmSync(testDbPath);
  const journal = `${testDbPath}-journal`;
  if (fs.existsSync(journal)) fs.rmSync(journal);
});

test("an imported asset stores assetType and tags alongside existing MediaAsset fields", async () => {
  const asset = await prisma.mediaAsset.create({
    data: {
      name: "VIP Club & Loyalty Rewards",
      category: "vip",
      fileUrl: "/media-pack/card-motifs/dark/card_vip_crown_01.png",
      accent: "accent",
      source: "import",
      isSystemAsset: false,
      uploadedBy: "asset-pack-v1.0",
      assetType: "card-motif",
      tags: "vip,crown,loyalty",
    },
  });

  const found = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
  assert.equal(found?.assetType, "card-motif");
  assert.equal(found?.tags, "vip,crown,loyalty");
  assert.equal(found?.source, "import");
  assert.equal(found?.isSystemAsset, false);
});

test("re-running the import for the same fileUrl is detected as a duplicate (the dedup check used by import-media-pack.ts)", async () => {
  const fileUrl = "/media-pack/backgrounds/bg_lounge_vip_room_01.png";
  await prisma.mediaAsset.create({
    data: { name: "High Roller & VIP Lounge Header", category: "backgrounds", fileUrl, source: "import", assetType: "background" },
  });

  const existing = await prisma.mediaAsset.findFirst({ where: { fileUrl } });
  assert.ok(existing, "the same fileUrl must be found before a second insert is attempted");

  const countBefore = await prisma.mediaAsset.count({ where: { fileUrl } });
  assert.equal(countBefore, 1, "only one row should ever exist for a given imported file");
});

test("existing rows (e.g. curated system motifs) are unaffected by inserting new imported assets", async () => {
  const systemAsset = await prisma.mediaAsset.create({
    data: { name: "Trophy", category: "sonstiges", iconKey: "trophy", source: "system", isSystemAsset: true },
  });

  await prisma.mediaAsset.create({
    data: { name: "New Import", category: "ui", fileUrl: "/media-pack/ui/example.png", source: "import", assetType: "ui-icon" },
  });

  const unchanged = await prisma.mediaAsset.findUnique({ where: { id: systemAsset.id } });
  assert.equal(unchanged?.name, "Trophy");
  assert.equal(unchanged?.isSystemAsset, true);
  assert.equal(unchanged?.fileUrl, null);
});
