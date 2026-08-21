export type DesignConfig = {
  backgroundType: "solid" | "gradient" | "image";
  bgColor1: string;
  bgColor2: string;
  bgGradientAngle: number;
  bgImageUrl: string | null;
  bgOverlay: boolean;
  bgOverlayStrength: number; // 0-100

  cardColor: string;
  cardOpacity: number; // 0-100
  cardBorderColor: string;
  cardRadius: number; // px
  cardShadow: "none" | "soft" | "medium" | "strong";
  cardGlowStrength: number; // 0-100, used for featured cards

  textPrimary: string;
  textSecondary: string;

  buttonColor: string;
  buttonTextColor: string;
  buttonRadius: number;

  accentColor: string;
  secondaryAccentColor: string;
  featuredColor: string;
  maxContentWidth: number; // px
  cardGap: number; // px
  animationsEnabled: boolean;

  casinoBackgroundEnabled: boolean;
  particlesEnabled: boolean;
  particleIntensity: "low" | "medium";
  parallaxStrength: number; // 0-100
  glowIntensity: number; // 0-100
};

export const DEFAULT_DESIGN: DesignConfig = {
  backgroundType: "gradient",
  bgColor1: "#040308",
  bgColor2: "#0c0716",
  bgGradientAngle: 160,
  bgImageUrl: null,
  bgOverlay: true,
  bgOverlayStrength: 25,

  cardColor: "#0e0b18",
  cardOpacity: 70,
  cardBorderColor: "#ffffff",
  cardRadius: 16,
  cardShadow: "medium",
  cardGlowStrength: 55,

  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",

  buttonColor: "#8b3eff",
  buttonTextColor: "#ffffff",
  buttonRadius: 14,

  accentColor: "#8b3eff",
  secondaryAccentColor: "#ff2d95",
  featuredColor: "#f0b840",
  maxContentWidth: 1280,
  cardGap: 24,
  animationsEnabled: true,

  casinoBackgroundEnabled: true,
  particlesEnabled: true,
  particleIntensity: "low",
  parallaxStrength: 45,
  glowIntensity: 55,
};

export type ThemePresetDef = {
  name: string;
  config: DesignConfig;
};

export const BUILT_IN_THEMES: ThemePresetDef[] = [
  { name: "Mace Dark", config: DEFAULT_DESIGN },
  {
    name: "Midnight Glass",
    config: {
      ...DEFAULT_DESIGN,
      bgColor1: "#05050a",
      bgColor2: "#0d1220",
      cardColor: "#0f1424",
      cardOpacity: 55,
      cardBorderColor: "#7fd8ff",
      cardGlowStrength: 35,
      accentColor: "#5ad1ff",
      buttonColor: "#2fb8e6",
    },
  },
  {
    name: "Neon Edge",
    config: {
      ...DEFAULT_DESIGN,
      bgColor1: "#0a0612",
      bgColor2: "#150a26",
      cardColor: "#160f26",
      cardBorderColor: "#ff5ec4",
      cardGlowStrength: 70,
      accentColor: "#ff5ec4",
      buttonColor: "#ff5ec4",
      textSecondary: "#c9a8e0",
    },
  },
  {
    name: "Royal Dark",
    config: {
      ...DEFAULT_DESIGN,
      bgColor1: "#0a0906",
      bgColor2: "#1a1408",
      cardColor: "#1c1710",
      cardBorderColor: "#e2b84f",
      cardGlowStrength: 45,
      accentColor: "#e2b84f",
      buttonColor: "#c99a2e",
      buttonTextColor: "#161208",
    },
  },
  {
    name: "Clean Light",
    config: {
      ...DEFAULT_DESIGN,
      backgroundType: "solid",
      bgColor1: "#f5f5f8",
      bgColor2: "#f5f5f8",
      bgOverlay: false,
      cardColor: "#ffffff",
      cardOpacity: 100,
      cardBorderColor: "#000000",
      cardGlowStrength: 15,
      textPrimary: "#1a1a24",
      textSecondary: "#5b5b6b",
      accentColor: "#5533ee",
      buttonColor: "#5533ee",
      casinoBackgroundEnabled: false,
      particlesEnabled: false,
    },
  },
];

export function parseDesignConfig(json: string): DesignConfig {
  try {
    const parsed = JSON.parse(json);
    return { ...DEFAULT_DESIGN, ...parsed };
  } catch {
    return DEFAULT_DESIGN;
  }
}

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16
  );
  if (Number.isNaN(bigint)) return hex;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const a = Math.max(0, Math.min(100, alphaPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function designToCssVars(cfg: DesignConfig): Record<string, string> {
  const shadowMap: Record<DesignConfig["cardShadow"], string> = {
    none: "none",
    soft: "0 4px 20px rgba(0,0,0,0.25)",
    medium: "0 8px 32px rgba(0,0,0,0.4)",
    strong: "0 16px 48px rgba(0,0,0,0.55)",
  };

  const background =
    cfg.backgroundType === "solid"
      ? cfg.bgColor1
      : cfg.backgroundType === "gradient"
      ? `linear-gradient(${cfg.bgGradientAngle}deg, ${cfg.bgColor1}, ${cfg.bgColor2})`
      : cfg.bgColor1;

  return {
    "--msb-bg": background,
    "--msb-bg-image": cfg.backgroundType === "image" && cfg.bgImageUrl ? `url(${cfg.bgImageUrl})` : "none",
    "--msb-bg-overlay": cfg.bgOverlay ? hexToRgba("#000000", cfg.bgOverlayStrength) : "transparent",
    "--msb-card-bg": hexToRgba(cfg.cardColor, cfg.cardOpacity),
    "--msb-card-border": hexToRgba(cfg.cardBorderColor, 14),
    "--msb-card-radius": `${cfg.cardRadius}px`,
    "--msb-card-shadow": shadowMap[cfg.cardShadow],
    "--msb-card-glow": hexToRgba(cfg.accentColor, cfg.cardGlowStrength),
    "--msb-featured-glow": hexToRgba(
      cfg.featuredColor,
      Math.round((cfg.cardGlowStrength * Math.max(0, Math.min(100, cfg.glowIntensity))) / 100)
    ),
    "--msb-text-primary": cfg.textPrimary,
    "--msb-text-secondary": cfg.textSecondary,
    "--msb-button-bg": cfg.buttonColor,
    "--msb-button-text": cfg.buttonTextColor,
    "--msb-button-radius": `${cfg.buttonRadius}px`,
    "--msb-accent": cfg.accentColor,
    "--msb-accent-2": cfg.secondaryAccentColor,
    "--msb-featured": cfg.featuredColor,
    "--msb-glow-intensity": String(Math.max(0, Math.min(100, cfg.glowIntensity)) / 100),
    "--msb-max-width": `${cfg.maxContentWidth}px`,
    "--msb-card-gap": `${cfg.cardGap}px`,
  };
}
