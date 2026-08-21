"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/lib/actions/profile";

type Profile = {
  brandName: string;
  description: string;
  noticeText: string | null;
  shareEnabled: boolean;
  publicClicksVisible: boolean;
  searchEnabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  impressumText: string | null;
  datenschutzText: string | null;
  affiliateText: string | null;
  kontaktText: string | null;
  disclaimerText: string | null;
  showImpressumLink: boolean;
  showDatenschutzLink: boolean;
  showAffiliateLink: boolean;
  showKontaktLink: boolean;
  showDisclaimerLink: boolean;
};

const initialState: ProfileFormState = { error: null };

const inputClass =
  "rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      {children}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">Marke</h3>
        <Field label="Name *">
          <input name="brandName" required defaultValue={profile.brandName} className={inputClass} />
        </Field>
        <Field label="Beschreibung">
          <textarea name="description" rows={2} defaultValue={profile.description} className={inputClass} />
        </Field>
        <Field label="Hinweistext">
          <input name="noticeText" defaultValue={profile.noticeText || ""} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="shareEnabled" defaultChecked={profile.shareEnabled} /> Teilen-Button anzeigen
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="searchEnabled" defaultChecked={profile.searchEnabled} /> Suchfunktion aktivieren
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="publicClicksVisible" defaultChecked={profile.publicClicksVisible} /> Öffentliche Klickzahlen anzeigen
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">SEO &amp; Social Sharing</h3>
        <Field label="Seitentitel">
          <input name="seoTitle" defaultValue={profile.seoTitle || ""} className={inputClass} />
        </Field>
        <Field label="Meta-Beschreibung">
          <textarea name="seoDescription" rows={2} defaultValue={profile.seoDescription || ""} className={inputClass} />
        </Field>
        <Field label="Canonical URL">
          <input name="canonicalUrl" defaultValue={profile.canonicalUrl || ""} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="robotsIndex" defaultChecked={profile.robotsIndex} /> Von Suchmaschinen indexieren lassen
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">Rechtliche Inhalte</h3>
        <p className="text-xs text-white/40">
          MaceSlotsBonus erzeugt keine rechtsverbindlichen Texte. Bitte eigene, geprüfte Inhalte eintragen.
        </p>
        <Field label="Impressum">
          <textarea name="impressumText" rows={4} defaultValue={profile.impressumText || ""} className={inputClass} />
        </Field>
        <Field label="Datenschutz">
          <textarea name="datenschutzText" rows={4} defaultValue={profile.datenschutzText || ""} className={inputClass} />
        </Field>
        <Field label="Affiliate-Hinweis">
          <textarea name="affiliateText" rows={4} defaultValue={profile.affiliateText || ""} className={inputClass} />
        </Field>
        <Field label="Kontakt">
          <textarea name="kontaktText" rows={4} defaultValue={profile.kontaktText || ""} className={inputClass} />
        </Field>
        <Field label="Zusätzlicher Hinweis / Disclaimer">
          <textarea name="disclaimerText" rows={4} defaultValue={profile.disclaimerText || ""} className={inputClass} />
        </Field>

        <div className="border-t border-white/10 pt-4">
          <p className="mb-2 text-xs font-medium text-white/60">
            Footer-Links (die Seiten selbst bleiben unter ihrer URL erreichbar, auch wenn hier deaktiviert)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="showImpressumLink" defaultChecked={profile.showImpressumLink} /> Impressum
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="showDatenschutzLink" defaultChecked={profile.showDatenschutzLink} /> Datenschutz
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="showAffiliateLink" defaultChecked={profile.showAffiliateLink} /> Affiliate-Hinweis
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="showKontaktLink" defaultChecked={profile.showKontaktLink} /> Kontakt
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="showDisclaimerLink" defaultChecked={profile.showDisclaimerLink} /> Hinweis
            </label>
          </div>
        </div>
      </section>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
      >
        {pending ? "Speichern…" : "Speichern"}
      </button>
    </form>
  );
}
