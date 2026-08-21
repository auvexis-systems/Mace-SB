"use client";

import { useRef, useState, useTransition } from "react";
import { DEFAULT_DESIGN, BUILT_IN_THEMES, designToCssVars, type DesignConfig } from "@/lib/design";
import { updateDesignAction, applyThemePresetAction } from "@/lib/actions/profile";
import { OfferCard, type PublicCardData } from "@/components/public/offer-card";
import { Check, Save } from "lucide-react";

type Theme = { id: string; name: string };

const PREVIEW_CARD: PublicCardData = {
  id: "preview",
  title: "Demo Offer Alpha",
  shortDesc: "So sieht eine Card mit Ihrem Design aus.",
  longDesc: null,
  imageUrl: null,
  imageAlt: null,
  badge: "Neu",
  promoCode: "DEMO10",
  oldPrice: "49€",
  newPrice: "29€",
  discountText: "-40%",
  expiresAt: null,
  hint: null,
  ctaText: "Jetzt ansehen",
  cta2Text: null,
  cta2Url: null,
  cta2NewTab: true,
  tags: ["demo"],
  featured: true,
  category: null,
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-12 rounded border border-white/15 bg-black/30 cursor-pointer"
    />
  );
}

function RangeInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32"
      />
      <span className="w-10 text-right text-xs text-white/50">{value}</span>
    </div>
  );
}

export function DesignEditor({
  initialDesign,
  activeThemeId,
  themes,
  brandName,
}: {
  initialDesign: DesignConfig;
  activeThemeId: string | null;
  themes: Theme[];
  brandName: string;
}) {
  const [design, setDesign] = useState<DesignConfig>(initialDesign);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(activeThemeId);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function update<K extends keyof DesignConfig>(key: K, value: DesignConfig[K]) {
    setSelectedTheme(null);
    setDesign((d) => {
      const next = { ...d, [key]: value };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          await updateDesignAction(next, null);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        });
      }, 400);
      return next;
    });
  }

  function applyTheme(theme: Theme, config: DesignConfig) {
    setSelectedTheme(theme.id);
    setDesign(config);
    startTransition(async () => {
      await applyThemePresetAction(theme.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  const cssVars = designToCssVars(design) as React.CSSProperties;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-sm text-white/60">Status</span>
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            {pending ? "Speichert…" : saved ? (
              <>
                <Check className="w-4 h-4" /> Gespeichert
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white/30" /> Änderungen werden automatisch gespeichert
              </>
            )}
          </span>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Theme-Presets</h2>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <ThemeButton key={t.id} theme={t} active={selectedTheme === t.id} onApply={applyTheme} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Hintergrund</h2>
          <Row label="Typ">
            <select
              value={design.backgroundType}
              onChange={(e) => update("backgroundType", e.target.value as DesignConfig["backgroundType"])}
              className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm"
            >
              <option value="solid">Einfarbig</option>
              <option value="gradient">Gradient</option>
              <option value="image">Bild</option>
            </select>
          </Row>
          <Row label="Farbe 1">
            <ColorInput value={design.bgColor1} onChange={(v) => update("bgColor1", v)} />
          </Row>
          {design.backgroundType === "gradient" && (
            <>
              <Row label="Farbe 2">
                <ColorInput value={design.bgColor2} onChange={(v) => update("bgColor2", v)} />
              </Row>
              <Row label="Winkel">
                <RangeInput value={design.bgGradientAngle} onChange={(v) => update("bgGradientAngle", v)} min={0} max={360} />
              </Row>
            </>
          )}
          {design.backgroundType === "image" && (
            <Row label="Bild-URL">
              <input
                value={design.bgImageUrl || ""}
                onChange={(e) => update("bgImageUrl", e.target.value || null)}
                placeholder="/uploads/…"
                className="w-40 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-xs"
              />
            </Row>
          )}
          <Row label="Overlay">
            <input
              type="checkbox"
              checked={design.bgOverlay}
              onChange={(e) => update("bgOverlay", e.target.checked)}
            />
          </Row>
          {design.bgOverlay && (
            <Row label="Overlay-Stärke">
              <RangeInput value={design.bgOverlayStrength} onChange={(v) => update("bgOverlayStrength", v)} min={0} max={100} />
            </Row>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Cards</h2>
          <Row label="Farbe">
            <ColorInput value={design.cardColor} onChange={(v) => update("cardColor", v)} />
          </Row>
          <Row label="Transparenz">
            <RangeInput value={design.cardOpacity} onChange={(v) => update("cardOpacity", v)} min={0} max={100} />
          </Row>
          <Row label="Border-Farbe">
            <ColorInput value={design.cardBorderColor} onChange={(v) => update("cardBorderColor", v)} />
          </Row>
          <Row label="Rundung">
            <RangeInput value={design.cardRadius} onChange={(v) => update("cardRadius", v)} min={0} max={40} />
          </Row>
          <Row label="Schatten">
            <select
              value={design.cardShadow}
              onChange={(e) => update("cardShadow", e.target.value as DesignConfig["cardShadow"])}
              className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm"
            >
              <option value="none">Kein</option>
              <option value="soft">Sanft</option>
              <option value="medium">Mittel</option>
              <option value="strong">Stark</option>
            </select>
          </Row>
          <Row label="Glow-Stärke (Featured)">
            <RangeInput value={design.cardGlowStrength} onChange={(v) => update("cardGlowStrength", v)} min={0} max={100} />
          </Row>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Text</h2>
          <Row label="Haupttextfarbe">
            <ColorInput value={design.textPrimary} onChange={(v) => update("textPrimary", v)} />
          </Row>
          <Row label="Sekundärtextfarbe">
            <ColorInput value={design.textSecondary} onChange={(v) => update("textSecondary", v)} />
          </Row>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Buttons</h2>
          <Row label="Farbe">
            <ColorInput value={design.buttonColor} onChange={(v) => update("buttonColor", v)} />
          </Row>
          <Row label="Textfarbe">
            <ColorInput value={design.buttonTextColor} onChange={(v) => update("buttonTextColor", v)} />
          </Row>
          <Row label="Rundung">
            <RangeInput value={design.buttonRadius} onChange={(v) => update("buttonRadius", v)} min={0} max={30} />
          </Row>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Allgemein</h2>
          <Row label="Akzentfarbe">
            <ColorInput value={design.accentColor} onChange={(v) => update("accentColor", v)} />
          </Row>
          <Row label="Max. Inhaltsbreite">
            <RangeInput value={design.maxContentWidth} onChange={(v) => update("maxContentWidth", v)} min={400} max={1400} />
          </Row>
          <Row label="Card-Abstand">
            <RangeInput value={design.cardGap} onChange={(v) => update("cardGap", v)} min={8} max={40} />
          </Row>
          <Row label="Animationen">
            <input
              type="checkbox"
              checked={design.animationsEnabled}
              onChange={(e) => update("animationsEnabled", e.target.checked)}
            />
          </Row>
          <button
            type="button"
            onClick={() => {
              setDesign(DEFAULT_DESIGN);
              setSelectedTheme(null);
              startTransition(() => updateDesignAction(DEFAULT_DESIGN, null));
            }}
            className="mt-3 text-xs text-white/40 hover:text-white/70 hover:underline"
          >
            Auf Standard zurücksetzen
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/80">Casino-Hintergrund &amp; Bewegung</h2>
          <Row label="Casino-Hintergrund aktiv">
            <input
              type="checkbox"
              checked={design.casinoBackgroundEnabled}
              onChange={(e) => update("casinoBackgroundEnabled", e.target.checked)}
            />
          </Row>
          {design.casinoBackgroundEnabled && (
            <Row label="Parallax-Stärke">
              <RangeInput value={design.parallaxStrength} onChange={(v) => update("parallaxStrength", v)} min={0} max={100} />
            </Row>
          )}
          <Row label="Partikel aktiv">
            <input
              type="checkbox"
              checked={design.particlesEnabled}
              onChange={(e) => update("particlesEnabled", e.target.checked)}
            />
          </Row>
          {design.particlesEnabled && (
            <Row label="Partikelintensität">
              <select
                value={design.particleIntensity}
                onChange={(e) => update("particleIntensity", e.target.value as DesignConfig["particleIntensity"])}
                className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
              </select>
            </Row>
          )}
          <Row label="Glow-Intensität">
            <RangeInput value={design.glowIntensity} onChange={(v) => update("glowIntensity", v)} min={0} max={100} />
          </Row>
          <Row label="Sekundärer Akzent">
            <ColorInput value={design.secondaryAccentColor} onChange={(v) => update("secondaryAccentColor", v)} />
          </Row>
          <Row label="Featured-Farbe">
            <ColorInput value={design.featuredColor} onChange={(v) => update("featuredColor", v)} />
          </Row>
        </section>
      </div>

      <div className="xl:sticky xl:top-8">
        <p className="mb-2 text-xs font-medium text-white/40">Live-Vorschau</p>
        <div className="msb-page rounded-2xl overflow-hidden" style={cssVars}>
          <div className="relative z-10 mx-auto flex flex-col gap-6 px-4 py-10" style={{ maxWidth: "var(--msb-max-width)" }}>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold msb-btn-primary">
                {brandName.slice(0, 1).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold msb-text-primary">{brandName}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--msb-card-gap)" }}>
              <OfferCard card={PREVIEW_CARD} showClicks={false} />
              <OfferCard card={{ ...PREVIEW_CARD, featured: false, badge: "Beliebt", promoCode: null }} showClicks={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeButton({
  theme,
  active,
  onApply,
}: {
  theme: Theme;
  active: boolean;
  onApply: (theme: Theme, config: DesignConfig) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const preset = BUILT_IN_THEMES.find((p) => p.name === theme.name);
        onApply(theme, preset?.config ?? DEFAULT_DESIGN);
      }}
      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        active ? "border-violet-400 bg-violet-500/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {theme.name}
    </button>
  );
}
