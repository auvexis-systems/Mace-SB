import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "../generated/prisma";

const testDbPath = path.join(__dirname, "..", "..", "prisma", "test.db");
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

test("a new card defaults to DRAFT and is excluded from the public feed", async () => {
  const card = await prisma.card.create({
    data: { title: "Demo A", shortDesc: "Kurz", ctaUrl: "https://example.com/a", position: 0 },
  });
  assert.equal(card.status, "DRAFT");

  const publicCards = await prisma.card.findMany({ where: { status: "PUBLISHED" } });
  assert.equal(publicCards.find((c) => c.id === card.id), undefined);
});

test("publishing a card makes it appear in the public feed; disabling removes it", async () => {
  const card = await prisma.card.create({
    data: {
      title: "Demo B",
      shortDesc: "Kurz",
      ctaUrl: "https://example.com/b",
      position: 1,
      status: "PUBLISHED",
    },
  });

  let publicCards = await prisma.card.findMany({ where: { status: "PUBLISHED" } });
  assert.ok(publicCards.some((c) => c.id === card.id));

  await prisma.card.update({ where: { id: card.id }, data: { status: "DISABLED" } });
  publicCards = await prisma.card.findMany({ where: { status: "PUBLISHED" } });
  assert.equal(publicCards.some((c) => c.id === card.id), false);
});

test("cards are ordered by position and reordering persists", async () => {
  const a = await prisma.card.create({
    data: { title: "Pos A", shortDesc: "x", ctaUrl: "https://example.com/pa", position: 10 },
  });
  const b = await prisma.card.create({
    data: { title: "Pos B", shortDesc: "x", ctaUrl: "https://example.com/pb", position: 11 },
  });

  let ordered = await prisma.card.findMany({
    where: { id: { in: [a.id, b.id] } },
    orderBy: { position: "asc" },
  });
  assert.deepEqual(ordered.map((c) => c.id), [a.id, b.id]);

  await prisma.$transaction([
    prisma.card.update({ where: { id: a.id }, data: { position: 20 } }),
    prisma.card.update({ where: { id: b.id }, data: { position: 5 } }),
  ]);

  ordered = await prisma.card.findMany({
    where: { id: { in: [a.id, b.id] } },
    orderBy: { position: "asc" },
  });
  assert.deepEqual(ordered.map((c) => c.id), [b.id, a.id]);
});

test("deleting a card removes it permanently", async () => {
  const card = await prisma.card.create({
    data: { title: "To Delete", shortDesc: "x", ctaUrl: "https://example.com/d", position: 99 },
  });
  await prisma.card.delete({ where: { id: card.id } });
  const found = await prisma.card.findUnique({ where: { id: card.id } });
  assert.equal(found, null);
});

test("promo code round-trips through create and read", async () => {
  const card = await prisma.card.create({
    data: {
      title: "Promo Card",
      shortDesc: "x",
      ctaUrl: "https://example.com/promo",
      promoCode: "TEST123",
      position: 100,
    },
  });
  const found = await prisma.card.findUnique({ where: { id: card.id } });
  assert.equal(found?.promoCode, "TEST123");
});

test("only active categories are meant to be shown publicly", async () => {
  const active = await prisma.category.create({
    data: { name: "Aktiv Test", slug: "aktiv-test", active: true, position: 0 },
  });
  const inactive = await prisma.category.create({
    data: { name: "Inaktiv Test", slug: "inaktiv-test", active: false, position: 1 },
  });

  const activeCategories = await prisma.category.findMany({ where: { active: true } });
  assert.ok(activeCategories.some((c) => c.id === active.id));
  assert.equal(activeCategories.some((c) => c.id === inactive.id), false);
});

test("a click event records against a card without storing raw IP", async () => {
  const card = await prisma.card.create({
    data: { title: "Tracked", shortDesc: "x", ctaUrl: "https://example.com/t", position: 200 },
  });
  await prisma.clickEvent.create({
    data: { cardId: card.id, deviceType: "DESKTOP", ipHash: "abc123" },
  });
  const count = await prisma.clickEvent.count({ where: { cardId: card.id } });
  assert.equal(count, 1);
});
