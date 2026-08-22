// One-time, re-runnable bulk import for a curated design asset pack into the
// MediaAsset table. Additive only: never touches existing rows, only ever
// inserts new ones, and skips anything it already imported (matched by the
// public fileUrl it would create) so re-running the script is always safe.
//
// Two source modes, picked automatically:
//   - "raw pack" — assets/MaceSlotsBonus_AssetPack_v1.0/ exists (the authoring
//     machine that first ran the import). Files are copied into public/media-pack.
//   - "already deployed" — that raw folder is intentionally NOT committed to
//     git (avoids doubling ~37MB of binaries in the repo), so on a fresh
//     environment like Render only the already-committed public/media-pack
//     copy exists. In that case the same PNGs are read directly from there
//     (no copy needed) and only the missing MediaAsset rows are created —
//     this is exactly the path needed to backfill a production database
//     after a deploy that only carried the code, not the local dev database.
//
// Usage: npm run import:media-pack
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import type { MediaCategory } from "../src/lib/media";

const prisma = new PrismaClient();

const SOURCE_ROOT = path.join(__dirname, "..", "assets", "MaceSlotsBonus_AssetPack_v1.0");
const PUBLIC_ROOT = path.join(__dirname, "..", "public", "media-pack");
const USING_RAW_SOURCE = fs.existsSync(SOURCE_ROOT);

type Meta = { label: string; tags: string[]; category?: MediaCategory };

// Hand-written from the asset pack's own README.md so imported names/tags
// read naturally instead of being derived mechanically from filenames.
const CARD_MOTIF_META: Record<string, Meta> = {
  card_slot_neon777_01: { label: "Slot Machines & Freispiele", tags: ["slots", "freispiele", "neon"], category: "slots" },
  card_vip_crown_01: { label: "VIP Club & Loyalty Rewards", tags: ["vip", "crown", "loyalty"], category: "vip" },
  card_vip_diamond_01: { label: "High Roller & Exclusive Boni", tags: ["vip", "diamond", "high-roller"], category: "vip" },
  card_item_poker_chips_01: { label: "Poker & Live Dealer", tags: ["poker", "chips", "live-dealer"], category: "chips" },
  card_item_cards_ace_king_01: { label: "Blackjack & Baccarat", tags: ["karten", "blackjack", "baccarat"], category: "karten" },
  card_item_black_glass_dice_01: { label: "Craps & Dice Games", tags: ["wuerfel", "craps", "dice"], category: "wuerfel" },
  card_item_roulette_wheel_01: { label: "Roulette Hub & Live Tables", tags: ["roulette", "live-tables"], category: "slots" },
  card_item_jackpot_coins_01: { label: "Progressive Jackpots & Cash Drops", tags: ["jackpot", "coins", "cash-drop"], category: "jackpot" },
  card_item_bonus_ticket_01: { label: "Promo Codes & Voucher Tickets", tags: ["promo", "bonus", "ticket"], category: "sonstiges" },
  card_item_giftbox_neon_01: { label: "Welcome Package & Mystery Box", tags: ["welcome", "giftbox", "mystery"], category: "sonstiges" },
  card_item_gold_trophy_01: { label: "Turniere & Leaderboards", tags: ["trophy", "turniere", "leaderboard"], category: "sonstiges" },
  card_item_fortune_wheel_01: { label: "Daily Lucky Wheel & Spin Boni", tags: ["wheel", "daily", "spin"], category: "slots" },
};

const BACKGROUND_META: Record<string, Meta> = {
  bg_lounge_vip_room_01: { label: "High Roller & VIP Lounge Header", tags: ["vip", "lounge", "header"] },
  bg_abstract_neon_circuit_01: { label: "Dark Circuit Neon Hero Card Background", tags: ["neon", "circuit", "hero"] },
  bg_luxury_dark_gold_01: { label: "Brushed Black & Gold Minimalistic Card Background", tags: ["luxury", "gold", "minimal"] },
  bg_poly_purple_neon_01: { label: "Low-Poly 3D Purple Velvet Background", tags: ["purple", "poly", "neon"] },
};

const UI_META: Record<string, Meta> = {
  ui_icon_token_crown_01: { label: "Badge / Mini Token Icon", tags: ["badge", "token", "crown"] },
};

type PlannedAsset = {
  sourcePath: string;
  publicRelPath: string;
  name: string;
  category: string;
  tags: string[];
  assetType: "background" | "card-motif" | "ui-icon";
  accent: "accent" | "accent2" | "featured";
};

function listPng(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();
}

// Resolves one section's source directory (and the files in it), preferring
// the raw asset pack when present, otherwise the already-deployed copy under
// public/media-pack. rawSubdir/publicSubdir describe the same section in each
// layout, e.g. "01_Backgrounds" vs "backgrounds".
function collectSection(rawSubdir: string, publicSubdir: string): { filename: string; sourcePath: string }[] {
  const dir = USING_RAW_SOURCE ? path.join(SOURCE_ROOT, rawSubdir) : path.join(PUBLIC_ROOT, publicSubdir);
  return listPng(dir).map((filename) => ({ filename, sourcePath: path.join(dir, filename) }));
}

// Rejects anything that isn't a real PNG (checked by magic bytes), regardless
// of its extension, before it's ever copied or referenced from the database.
function isValidPng(filePath: string): boolean {
  const fd = fs.openSync(filePath, "r");
  try {
    const header = Buffer.alloc(8);
    const bytesRead = fs.readSync(fd, header, 0, 8, 0);
    if (bytesRead < 8) return false;
    return header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  } finally {
    fs.closeSync(fd);
  }
}

function baseKey(filename: string): { key: string; isTransparent: boolean } {
  const withoutExt = filename.replace(/\.png$/i, "");
  const isTransparent = withoutExt.endsWith("_transparent");
  const key = isTransparent ? withoutExt.slice(0, -"_transparent".length) : withoutExt;
  return { key, isTransparent };
}

function planBackground(sourcePath: string, filename: string): PlannedAsset {
  const { key } = baseKey(filename);
  const meta = BACKGROUND_META[key];
  return {
    sourcePath,
    publicRelPath: path.posix.join("backgrounds", filename),
    name: meta?.label ?? key,
    category: "backgrounds",
    tags: meta?.tags ?? [],
    assetType: "background",
    accent: "accent",
  };
}

function planCardMotif(sourcePath: string, filename: string, variant: "dark" | "transparent"): PlannedAsset {
  const { key, isTransparent } = baseKey(filename);
  const meta = CARD_MOTIF_META[key];
  const label = meta?.label ?? key;
  return {
    sourcePath,
    publicRelPath: path.posix.join("card-motifs", variant, filename),
    name: isTransparent ? `${label} (Transparent)` : label,
    category: meta?.category ?? "sonstiges",
    tags: [...(meta?.tags ?? []), ...(isTransparent ? ["transparent"] : [])],
    assetType: "card-motif",
    accent: "accent",
  };
}

function planUi(sourcePath: string, filename: string): PlannedAsset {
  const { key, isTransparent } = baseKey(filename);
  const meta = UI_META[key];
  const label = meta?.label ?? key;
  return {
    sourcePath,
    publicRelPath: path.posix.join("ui", filename),
    name: isTransparent ? `${label} (Transparent)` : label,
    category: "ui",
    tags: [...(meta?.tags ?? []), ...(isTransparent ? ["transparent"] : [])],
    assetType: "ui-icon",
    accent: "featured",
  };
}

async function main() {
  console.log(
    USING_RAW_SOURCE
      ? `Quelle: Roh-Asset-Pack (${SOURCE_ROOT})`
      : `Roh-Asset-Pack nicht gefunden — verwende bereits ausgelieferte Kopie unter ${PUBLIC_ROOT}`
  );

  const plans: PlannedAsset[] = [];

  for (const { filename, sourcePath } of collectSection("01_Backgrounds", "backgrounds")) {
    plans.push(planBackground(sourcePath, filename));
  }
  for (const { filename, sourcePath } of collectSection("02_Card_Motifs_Dark", "card-motifs/dark")) {
    plans.push(planCardMotif(sourcePath, filename, "dark"));
  }
  for (const { filename, sourcePath } of collectSection("03_Card_Motifs_Transparent", "card-motifs/transparent")) {
    plans.push(planCardMotif(sourcePath, filename, "transparent"));
  }
  for (const { filename, sourcePath } of collectSection("04_UI_Assets", "ui")) {
    plans.push(planUi(sourcePath, filename));
  }

  if (plans.length === 0) {
    console.error("Kein Quellmaterial gefunden — weder das Roh-Asset-Pack noch public/media-pack enthalten PNGs.");
    process.exitCode = 1;
    return;
  }

  const invalid = plans.filter((p) => !isValidPng(p.sourcePath));
  if (invalid.length > 0) {
    console.error("Import abgebrochen — folgende Dateien sind keine gültigen PNGs:");
    for (const p of invalid) console.error(` - ${p.sourcePath}`);
    process.exitCode = 1;
    return;
  }

  let imported = 0;
  let skipped = 0;
  const importedFiles: string[] = [];

  for (const plan of plans) {
    const fileUrl = "/media-pack/" + plan.publicRelPath.split(path.sep).join("/");

    const existing = await prisma.mediaAsset.findFirst({ where: { fileUrl } });
    if (existing) {
      skipped++;
      continue;
    }

    const destPath = path.join(PUBLIC_ROOT, plan.publicRelPath);
    if (path.resolve(plan.sourcePath) !== path.resolve(destPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(plan.sourcePath, destPath);
    } else if (!fs.existsSync(destPath)) {
      // Deployed-copy mode expects the file to already be there (it's part
      // of the git-tracked build); if it's missing there's nothing to copy
      // it from, so skip this one rather than writing a dangling DB row.
      console.error(`Übersprungen (Datei fehlt): ${destPath}`);
      skipped++;
      continue;
    }

    await prisma.mediaAsset.create({
      data: {
        name: plan.name,
        category: plan.category,
        fileUrl,
        accent: plan.accent,
        source: "import",
        isSystemAsset: false,
        uploadedBy: "asset-pack-v1.0",
        assetType: plan.assetType,
        tags: plan.tags.join(","),
      },
    });
    imported++;
    importedFiles.push(`${fileUrl}  —  ${plan.name}  [${plan.category}/${plan.assetType}]`);
  }

  console.log(`Import abgeschlossen: ${imported} neu importiert, ${skipped} bereits vorhanden (übersprungen).`);
  if (importedFiles.length > 0) {
    console.log("\nNeu importierte Dateien:");
    for (const line of importedFiles) console.log(` - ${line}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
