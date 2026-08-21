"use client";

import { useActionState, useState } from "react";
import { createCardAction, updateCardAction, type CardFormState } from "@/lib/actions/cards";
import { ImageUpload } from "@/components/admin/image-upload";
import { OfferCard, type PublicCardData } from "@/components/public/offer-card";
import { Eye, EyeOff } from "lucide-react";

type Category = { id: string; name: string };

export type CardFormValues = {
  id?: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  imageUrl: string | null;
  imageAlt: string;
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
  badge: "",
  promoCode: "",
  oldPrice: "",
  newPrice: "",
  discountText: "",
  expiresAt: "",
  hint: "",
  ctaText: "Jetzt ansehen",
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
}: {
  initial?: CardFormValues;
  categories: Category[];
}) {
  const isEdit = Boolean(initial?.id);
  const [values, setValues] = useState<CardFormValues>(initial ?? EMPTY);
  const [showPreview, setShowPreview] = useState(false);

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
    title: values.title || "Titel der Card",
    shortDesc: values.shortDesc || "Kurzbeschreibung der Card",
    longDesc: values.longDesc || null,
    imageUrl: values.imageUrl,
    imageAlt: values.imageAlt || null,
    badge: values.badge || null,
    promoCode: values.promoCode || null,
    oldPrice: values.oldPrice || null,
    newPrice: values.newPrice || null,
    discountText: values.discountText || null,
    expiresAt: values.expiresAt || null,
    hint: values.hint || null,
    ctaText: values.ctaText || "Jetzt ansehen",
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
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Kurzbeschreibung *" error={state.fieldErrors?.shortDesc}>
            <input
              name="shortDesc"
              required
              value={values.shortDesc}
              onChange={(e) => set("shortDesc", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Langbeschreibung">
            <textarea
              name="longDesc"
              rows={3}
              value={values.longDesc}
              onChange={(e) => set("longDesc", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Kategorie">
            <select
              name="categoryId"
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputClass}
            >
              <option value="">Ohne Kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags (durch Komma getrennt)">
            <input
              name="tags"
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="z.B. neu, empfehlung"
              className={inputClass}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Bild</h2>
          <ImageUpload
            value={values.imageUrl}
            onChange={(url) => set("imageUrl", url)}
            altValue={values.imageAlt}
            onAltChange={(alt) => set("imageAlt", alt)}
          />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Angebot</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Badge">
              <input name="badge" value={values.badge} onChange={(e) => set("badge", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Promo-Code">
              <input name="promoCode" value={values.promoCode} onChange={(e) => set("promoCode", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Alter Preis">
              <input name="oldPrice" value={values.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Neuer Preis">
              <input name="newPrice" value={values.newPrice} onChange={(e) => set("newPrice", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Rabatttext">
              <input name="discountText" value={values.discountText} onChange={(e) => set("discountText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ablaufdatum">
              <input
                type="date"
                name="expiresAt"
                value={values.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Hinweis">
            <input name="hint" value={values.hint} onChange={(e) => set("hint", e.target.value)} className={inputClass} />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/80">Call-to-Action</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Buttontext">
              <input name="ctaText" value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ziel-URL *" error={state.fieldErrors?.ctaUrl}>
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
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="ctaNewTab"
              checked={values.ctaNewTab}
              onChange={(e) => set("ctaNewTab", e.target.checked)}
            />
            In neuem Tab öffnen
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Zweiter Button (Text)">
              <input name="cta2Text" value={values.cta2Text} onChange={(e) => set("cta2Text", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Zweiter Button (URL)" error={state.fieldErrors?.cta2Url}>
              <input name="cta2Url" value={values.cta2Url} onChange={(e) => set("cta2Url", e.target.value)} className={inputClass} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="cta2NewTab"
              checked={values.cta2NewTab}
              onChange={(e) => set("cta2NewTab", e.target.checked)}
            />
            Zweiten Button in neuem Tab öffnen
          </label>
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
            Als Featured hervorheben
          </label>
        </section>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
          >
            {pending ? "Speichern…" : isEdit ? "Änderungen speichern" : "Card erstellen"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/70"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Vorschau
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
