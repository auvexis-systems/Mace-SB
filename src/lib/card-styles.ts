export type CardStyleKey =
  | "purple-neon"
  | "hot-pink"
  | "royal-gold"
  | "midnight"
  | "vip"
  | "clean-dark";

export type CardStyleDef = {
  key: CardStyleKey;
  label: string;
  /** CSS colors used to render the swatch/preview and the live card. */
  accent: string;
  accent2: string;
  glow: string;
};

// Plain, named "looks" instead of raw colors/hex — this is the only design
// choice a card gets during creation. Kept intentionally small (six options).
export const CARD_STYLES: CardStyleDef[] = [
  { key: "purple-neon", label: "Purple Neon", accent: "#8b3eff", accent2: "#a374ff", glow: "#8b3eff" },
  { key: "hot-pink", label: "Hot Pink", accent: "#ff2d95", accent2: "#ff6bb8", glow: "#ff2d95" },
  { key: "royal-gold", label: "Royal Gold", accent: "#f0b840", accent2: "#e2b84f", glow: "#f0b840" },
  { key: "midnight", label: "Midnight", accent: "#6b7280", accent2: "#9ca3af", glow: "#6b7280" },
  { key: "vip", label: "VIP", accent: "#f0b840", accent2: "#8b3eff", glow: "#f0b840" },
  { key: "clean-dark", label: "Clean Dark", accent: "#a1a1aa", accent2: "#d4d4d8", glow: "#a1a1aa" },
];

export const DEFAULT_CARD_STYLE: CardStyleKey = "purple-neon";

export function getCardStyle(key: string | null | undefined): CardStyleDef {
  return CARD_STYLES.find((s) => s.key === key) ?? CARD_STYLES[0];
}
