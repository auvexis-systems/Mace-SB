"use client";

import { useActionState, useState } from "react";
import { createCardAction, updateCardAction, type CardFormState } from "@/lib/actions/cards";
import { type MediaAssetItem } from "@/components/admin/media-library";
import { StylePicker } from "@/components/admin/style-picker";
import { ImagePicker } from "@/components/admin/image-picker";
import { OfferCard, type PublicCardData } from "@/components/public/offer-card";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

type Category = { id: string; name: string };

export type CardFormValues = {
  id?: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  imageUrl: string | null;
  imageAlt: string;
  mediaIconKey: string | null;
  stylePreset: string;
  badge: string;
  promoCode: string;
  oldPrice: string;
  newPrice: string;
  discountText: string;
  expiresAt: string;
  hint: string;
  ctaText: string;
  ctaUrl: string;
  ctaNewTab: boolean;
  cta2Text: string;
  cta2Url: string;
  cta2NewTab: boolean;
  tags: string;
  status: "DRAFT" | "PUBLISHED" | "DISABLED";
  featured: boolean;
  categoryId: string;
};

const EMPTY: CardFormValues = {
  title: "",
  shortDesc: "",
  longDesc: "",
  imageUrl: null,
  imageAlt: "",
  mediaIconKey: null,
  stylePreset: "purple-neon",
  badge: "",
  promoCode: "",
  oldPrice: "",
  newPrice: "",
  discountText: "",
  expiresAt: "",
  hint: "",
  ctaText: "Zum Angebot",
  ctaUrl: "",
  ctaNewTab: true,
  cta2Text: "",
  cta2Url: "",
  cta2NewTab: true,
  tags: "",
  status: "DRAFT",
  featured: false,
  categoryId: "",
};

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400";

export function CardForm({
  initial,
  categories,
  mediaAssets,
}: {
  initial?: CardFormValues;
  categories: Category[];
  mediaAssets: MediaAssetItem[];
}) {
  const isEdit = Boolean(initial?.id);
  const [values, setValues] = useState<CardFormValues>(initial ?? EMPTY);
  const [showPreview, setShowPreview] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const action = isEdit
    ? updateCardAction.bind(null, initial!.id!)
    : createCardAction;

  const initialState: CardFormState = { error: null };
  const [state, formAction, pending] = useActionState(action, initialState);

  function set<K extends keyof CardFormValues>(key: K, val: CardFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const previewCard: PublicCardData = {
    id: "preview",
    title: values.title || "Titel des Angebots",
    shortDesc: values.shortDesc || "Kurzbeschreibung des Angebots",
    longDesc: values.longDesc || null,
    imageUrl: values.imageUrl,
    imageAlt: values.imageAlt || null,
    mediaIconKey: values.mediaIconKey,
    stylePreset: values.stylePreset || null,
    badge: values.badge || null,
    promoCode: values.promoCode || null,
    oldPrice: values.oldPrice || null,
    newPrice: values.newPrice || null,
    discountText: values.discountText || null,
    expiresAt: values.expiresAt || null,
    hint: values.hint || null,
    ctaText: values.ctaText || "Zum Angebot",
    cta2Text: values.cta2Text || null,
    cta2Url: values.cta2Url || null,
    cta2NewTab: values.cta2NewTab,
    tags: values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    featured: values.featured,
    category: null,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
      <form action={formAction} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Inhalt</h2>
          <Field label="Titel *" error={state.fieldErrors?.title}>
            <input
              name="title"
              required
              placeholder="z. B. VIP Bonus"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Beschreibung *" error={state.fieldErrors?.shortDesc}>
            <input
              name="shortDesc"
              required
              placeholder="Kurzer Text, der das Angebot beschreibt"
              value={values.shortDesc}
              onChange={(e) => set("shortDesc", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Highlight (z. B. „100 Freispiele“)">
            <input name="newPrice" value={values.newPrice} onChange={(e) => set("newPrice", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Promo-Code (optional)">
            <input name="promoCode" value={values.promoCode} onChange={(e) => set("promoCode", e.target.value)} className={inputClass} />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Button</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Buttontext">
              <input name="ctaText" value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Wohin soll der Button führen? *" error={state.fieldErrors?.ctaUrl}>
              <input
                name="ctaUrl"
                required
                value={values.ctaUrl}
                onChange={(e) => set("ctaUrl", e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Kategorie</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set("categoryId", "")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
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
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                  values.categoryId === c.id ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <input type="hidden" name="categoryId" value={values.categoryId} />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Bild</h2>
          <ImagePicker
            imageUrl={values.imageUrl}
            mediaIconKey={values.mediaIconKey}
            imageAlt={values.imageAlt}
            onAltChange={(alt) => set("imageAlt", alt)}
            onSelect={(media) => {
              set("imageUrl", media.imageUrl);
              set("mediaIconKey", media.mediaIconKey);
            }}
            mediaAssets={mediaAssets}
          />
          <input type="hidden" name="mediaIconKey" value={values.mediaIconKey ?? ""} />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Card-Stil</h2>
          <StylePicker value={values.stylePreset} onChange={(key) => set("stylePreset", key)} />
          <input type="hidden" name="stylePreset" value={values.stylePreset} />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Status</h2>
          <Field label="Status">
            <select
              name="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as CardFormValues["status"])}
              className={inputClass}
            >
              <option value="DRAFT">Entwurf</option>
              <option value="PUBLISHED">Veröffentlicht</option>
              <option value="DISABLED">Deaktiviert</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="featured"
              checked={values.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Besonders hervorheben
          </label>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-white/80"
          >
            Weitere Optionen
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>
          {advancedOpen && (
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Badge">
                <input name="badge" value={values.badge} onChange={(e) => set("badge", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Alter Preis">
                  <input name="oldPrice" value={values.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Rabatttext">
                  <input name="discountText" value={values.discountText} onChange={(e) => set("discountText", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Ablaufdatum">
                <input
                  type="date"
                  name="expiresAt"
                  value={values.expiresAt}
                  onChange={(e) => set("expiresAt", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Ausführlichere Beschreibung">
                <textarea
                  name="longDesc"
                  rows={3}
                  value={values.longDesc}
                  onChange={(e) => set("longDesc", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Hinweistext (klein, unter dem Angebot)">
                <input name="hint" value={values.hint} onChange={(e) => set("hint", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Stichwörter (durch Komma getrennt)">
                <input
                  name="tags"
                  value={values.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="z. B. neu, empfehlung"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="ctaNewTab"
                  checked={values.ctaNewTab}
                  onChange={(e) => set("ctaNewTab", e.target.checked)}
                />
                Button öffnet in neuem Tab
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Zweiter Button (Text)">
                  <input name="cta2Text" value={values.cta2Text} onChange={(e) => set("cta2Text", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Zweiter Button (Ziel)" error={state.fieldErrors?.cta2Url}>
                  <input name="cta2Url" value={values.cta2Url} onChange={(e) => set("cta2Url", e.target.value)} className={inputClass} />
                </Field>
              </div>
            </div>
          )}
        </section>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
          >
            {pending ? "Speichern…" : isEdit ? "Änderungen speichern" : "Angebot speichern"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/70"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Vorschau anzeigen
          </button>
        </div>
      </form>

      <div className={`${showPreview ? "block" : "hidden"} lg:block lg:sticky lg:top-8`}>
        <p className="mb-2 text-xs font-medium text-white/40">Live-Vorschau</p>
        <div className="msb-page rounded-2xl p-6" style={{ minHeight: 200 }}>
          <div className="max-w-[360px] mx-auto">
            <OfferCard card={previewCard} showClicks={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
