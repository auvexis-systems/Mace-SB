import { Trophy, Crown, Dices, Layers, Disc, Sparkles, Award, Gem, Target, type LucideIcon } from "lucide-react";
import type { Prisma } from "@/generated/prisma";

export type MediaCategory =
  | "slots"
  | "karten"
  | "chips"
  | "wuerfel"
  | "vip"
  | "jackpot"
  | "sonstiges"
  | "backgrounds"
  | "ui";

export const MEDIA_CATEGORIES: { key: MediaCategory | "alle"; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "slots", label: "Slots" },
  { key: "karten", label: "Karten" },
  { key: "chips", label: "Chips" },
  { key: "wuerfel", label: "Würfel" },
  { key: "vip", label: "VIP" },
  { key: "jackpot", label: "Jackpot" },
  { key: "backgrounds", label: "Hintergründe" },
  { key: "ui", label: "UI-Elemente" },
  { key: "sonstiges", label: "Sonstiges" },
];

export type MediaIconKey =
  | "trophy"
  | "crown"
  | "dice"
  | "cards"
  | "chips"
  | "777"
  | "vip"
  | "jackpot"
  | "roulette";

export const MEDIA_ICON_REGISTRY: Record<MediaIconKey, LucideIcon> = {
  trophy: Trophy,
  crown: Crown,
  dice: Dices,
  cards: Layers,
  chips: Disc,
  "777": Sparkles,
  vip: Award,
  jackpot: Gem,
  roulette: Target,
};

// The nine curated "system" motifs shown in the media library until real
// illustrated assets replace them. Not stored per-row in the database beyond
// what the seed script writes as MediaAsset rows — this array is the source
// of truth for name/category/icon/accent, kept in one place so the seed and
// any future re-seed stay in sync.
export const SYSTEM_MEDIA_MOTIFS: {
  name: string;
  iconKey: MediaIconKey;
  category: MediaCategory;
  accent: "accent" | "accent2" | "featured";
}[] = [
  { name: "Trophy", iconKey: "trophy", category: "sonstiges", accent: "accent" },
  { name: "Crown", iconKey: "crown", category: "vip", accent: "featured" },
  { name: "Dice", iconKey: "dice", category: "wuerfel", accent: "accent" },
  { name: "Playing Cards", iconKey: "cards", category: "karten", accent: "accent2" },
  { name: "Poker Chips", iconKey: "chips", category: "chips", accent: "accent" },
  { name: "777", iconKey: "777", category: "slots", accent: "accent2" },
  { name: "VIP", iconKey: "vip", category: "vip", accent: "featured" },
  { name: "Jackpot", iconKey: "jackpot", category: "jackpot", accent: "featured" },
  { name: "Roulette", iconKey: "roulette", category: "slots", accent: "accent2" },
];

export function mediaIconFor(key: string | null | undefined): LucideIcon {
  return MEDIA_ICON_REGISTRY[(key as MediaIconKey) || "trophy"] || Trophy;
}

// The gallery (MediaLibrary/AssetTile) only ever renders these fields — a
// Prisma select trims columns like `tags`/`assetType`/`uploadedBy` off the
// query result instead of fetching and then discarding them in JS. Shared
// across every page that loads the gallery so the shape always matches
// MediaAssetItem in media-library.tsx.
export const MEDIA_ASSET_GALLERY_SELECT = {
  id: true,
  name: true,
  category: true,
  fileUrl: true,
  iconKey: true,
  accent: true,
  isSystemAsset: true,
} satisfies Prisma.MediaAssetSelect;
