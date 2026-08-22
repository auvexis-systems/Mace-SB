"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { createCardAction, type CardFormState } from "@/lib/actions/cards";
import { type MediaAssetItem, type SelectedMedia } from "@/components/admin/media-library";
import { StylePicker } from "@/components/admin/style-picker";
import { ImagePicker } from "@/components/admin/image-picker";
import { OfferCard, type PublicCardData } from "@/components/public/offer-card";
import { DEFAULT_CARD_STYLE } from "@/lib/card-styles";

type Category = { id: string; name: string };

type WizardValues = {
  stylePreset: string;
  imageUrl: string | null;
  mediaIconKey: string | null;
  imageAlt: string;
  title: string;
  shortDesc: string;
  newPrice: string;
  promoCode: string;
  ctaText: string;
  ctaUrl: string;
  categoryId: string;
};

const EMPTY: WizardValues = {
  stylePreset: DEFAULT_CARD_STYLE,
  imageUrl: null,
  mediaIconKey: null,
  imageAlt: "",
  title: "",
  shortDesc: "",
  newPrice: "",
  promoCode: "",
  ctaText: "Zum Angebot",
  ctaUrl: "",
  categoryId: "",
};

const STEPS = ["Stil", "Bild", "Inhalt", "Kategorie", "Vorschau"] as const;

const inputClass =
  "rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400 w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      {children}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i === step
                ? "bg-violet-600 text-white"
                : i < step
                ? "bg-violet-600/30 text-violet-300"
                : "bg-white/10 text-white/40"
            }`}
          >
            {i + 1}
          </div>
          {i < STEPS.length - 1 && <div className={`h-px w-4 sm:w-8 ${i < step ? "bg-violet-500/50" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

export function CardWizard({
  categories,
  mediaAssets,
}: {
  categories: Category[];
  mediaAssets: MediaAssetItem[];
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>(EMPTY);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const initialState: CardFormState = { error: null };
  const [state, formAction, pending] = useActionState(createCardAction, initialState);

  function set<K extends keyof WizardValues>(key: K, val: WizardValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function onMediaSelect(media: SelectedMedia) {
    set("imageUrl", media.imageUrl);
    set("mediaIconKey", media.mediaIconKey);
  }

  const canProceed =
    step === 0 ||
    step === 1 ||
    (step === 2 && values.title.trim() && values.shortDesc.trim() && values.ctaUrl.trim()) ||
    step === 3 ||
    step === 4;

  const previewCard: PublicCardData = {
    id: "preview",
    title: values.title || "Titel des Angebots",
    shortDesc: values.shortDesc || "Kurzbeschreibung des Angebots",
    longDesc: null,
    imageUrl: values.imageUrl,
    imageAlt: values.imageAlt || null,
    mediaIconKey: values.mediaIconKey,
    stylePreset: values.stylePreset,
    badge: null,
    promoCode: values.promoCode || null,
    oldPrice: null,
    newPrice: values.newPrice || null,
    discountText: null,
    expiresAt: null,
    hint: null,
    ctaText: values.ctaText || "Zum Angebot",
    cta2Text: null,
    cta2Url: null,
    cta2NewTab: true,
    tags: [],
    featured: false,
    category: null,
  };

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator step={step} />

      <form action={formAction} className="flex flex-col gap-6">
        {/* Hidden fields always submitted, regardless of which step is visible. */}
        <input type="hidden" name="stylePreset" value={values.stylePreset} />
        <input type="hidden" name="imageUrl" value={values.imageUrl ?? ""} />
        <input type="hidden" name="mediaIconKey" value={values.mediaIconKey ?? ""} />
        <input type="hidden" name="imageAlt" value={values.imageAlt} />
        <input type="hidden" name="title" value={values.title} />
        <input type="hidden" name="shortDesc" value={values.shortDesc} />
        <input type="hidden" name="newPrice" value={values.newPrice} />
        <input type="hidden" name="promoCode" value={values.promoCode} />
        <input type="hidden" name="ctaText" value={values.ctaText} />
        <input type="hidden" name="ctaUrl" value={values.ctaUrl} />
        <input type="hidden" name="ctaNewTab" value="on" />
        <input type="hidden" name="categoryId" value={values.categoryId} />

        {step === 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Wähle einen Stil</h2>
            <p className="text-sm text-white/50">So wird dein Angebot später aussehen — du kannst das jederzeit ändern.</p>
            <StylePicker value={values.stylePreset} onChange={(key) => set("stylePreset", key)} />
          </section>
        )}

        {step === 1 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Wähle ein Bild</h2>
            <p className="text-sm text-white/50">Aus der Galerie oder ein eigenes Bild hochladen.</p>
            <ImagePicker
              imageUrl={values.imageUrl}
              mediaIconKey={values.mediaIconKey}
              imageAlt={values.imageAlt}
              onAltChange={(alt) => set("imageAlt", alt)}
              onSelect={onMediaSelect}
              mediaAssets={mediaAssets}
            />
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Inhalt</h2>
            <Field label="Titel *">
              <input
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="z. B. VIP Bonus"
                className={inputClass}
              />
            </Field>
            <Field label="Beschreibung *">
              <input
                value={values.shortDesc}
                onChange={(e) => set("shortDesc", e.target.value)}
                placeholder="Kurzer Text zu deinem Angebot"
                className={inputClass}
              />
            </Field>
            <Field label="Highlight">
              <input
                value={values.newPrice}
                onChange={(e) => set("newPrice", e.target.value)}
                placeholder="z. B. 100 Freispiele"
                className={inputClass}
              />
            </Field>
            <Field label="Promo-Code (optional)">
              <input value={values.promoCode} onChange={(e) => set("promoCode", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Buttontext">
              <input value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Wohin soll der Button führen? *">
              <input
                value={values.ctaUrl}
                onChange={(e) => set("ctaUrl", e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Kategorie</h2>
            <p className="text-sm text-white/50">Optional — hilft Besuchern beim Filtern.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => set("categoryId", "")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  values.categoryId === "" ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Ohne Kategorie
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set("categoryId", c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    values.categoryId === c.id ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vorschau</h2>
              <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
                    device === "desktop" ? "bg-white/15 text-white" : "text-white/50"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
                    device === "mobile" ? "bg-white/15 text-white" : "text-white/50"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Smartphone
                </button>
              </div>
            </div>
            <div className="msb-page rounded-2xl p-6" style={{ minHeight: 200 }}>
              <div className={`mx-auto ${device === "mobile" ? "max-w-[300px]" : "max-w-[380px]"}`}>
                <OfferCard card={previewCard} showClicks={false} />
              </div>
            </div>

            {state.error && <p className="text-sm text-red-400">{state.error}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="status"
                value="DRAFT"
                disabled={pending}
                className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-60"
              >
                Als Entwurf speichern
              </button>
              <button
                type="submit"
                name="status"
                value="PUBLISHED"
                disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
              >
                <ExternalLink className="h-4 w-4" /> Veröffentlichen
              </button>
            </div>
          </section>
        )}
      </form>

      {step < 4 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-40"
          >
            Weiter <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
