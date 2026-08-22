"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { updateSiteSettingsAction, type ProfileFormState } from "@/lib/actions/profile";
import { useToast } from "./toast-provider";

type Settings = {
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

const LEGAL_PAGES = [
  { key: "Impressum", enabledName: "showImpressumLink", textName: "impressumText", label: "Impressum" },
  { key: "Datenschutz", enabledName: "showDatenschutzLink", textName: "datenschutzText", label: "Datenschutz" },
  { key: "Affiliate", enabledName: "showAffiliateLink", textName: "affiliateText", label: "Affiliate-Hinweis" },
  { key: "Kontakt", enabledName: "showKontaktLink", textName: "kontaktText", label: "Kontakt" },
  { key: "Hinweis", enabledName: "showDisclaimerLink", textName: "disclaimerText", label: "Eigener Hinweis" },
] as const;

function LegalPageRow({
  label,
  enabledName,
  textName,
  defaultEnabled,
  defaultText,
}: {
  label: string;
  enabledName: string;
  textName: string;
  defaultEnabled: boolean;
  defaultText: string;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <label className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-white/80">
          <FileText className="h-4 w-4 text-white/40" /> {label}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-white/40">{enabled ? "Aktiviert" : "Deaktiviert"}</span>
          <input
            type="checkbox"
            name={enabledName}
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-9 shrink-0 appearance-none rounded-full bg-white/15 outline-none transition-colors checked:bg-violet-600 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4 cursor-pointer"
          />
        </span>
      </label>
      {enabled && (
        <textarea
          name={textName}
          rows={4}
          defaultValue={defaultText}
          placeholder={`Eigenen Text für "${label}" hier eintragen …`}
          className={`${inputClass} mt-3 w-full`}
        />
      )}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, initialState);
  const [seoOpen, setSeoOpen] = useState(false);
  const { showToast } = useToast();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      showToast("Einstellungen gespeichert ✓");
    }
    wasPending.current = pending;
  }, [pending, state.error, showToast]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">Zusätzliche Seiten</h3>
        <p className="text-xs text-white/40">
          Diese Seiten sind optional und standardmäßig ohne Text. MaceSlotsBonus erstellt keine rechtsverbindlichen
          Texte für dich — trage bei Bedarf eigene, geprüfte Inhalte ein.
        </p>
        <div className="flex flex-col gap-3">
          {LEGAL_PAGES.map((p) => (
            <LegalPageRow
              key={p.key}
              label={p.label}
              enabledName={p.enabledName}
              textName={p.textName}
              defaultEnabled={settings[p.enabledName]}
              defaultText={settings[p.textName] || ""}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <button
          type="button"
          onClick={() => setSeoOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span>
            <h3 className="text-sm font-semibold text-white/80">Suchmaschinen (SEO)</h3>
            <p className="text-xs text-white/40">Nur relevant, wenn du bei Google besser gefunden werden willst.</p>
          </span>
          <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${seoOpen ? "rotate-180" : ""}`} />
        </button>
        {seoOpen && (
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Seitentitel">
              <input name="seoTitle" defaultValue={settings.seoTitle || ""} className={inputClass} />
            </Field>
            <Field label="Kurzbeschreibung für Suchmaschinen">
              <textarea name="seoDescription" rows={2} defaultValue={settings.seoDescription || ""} className={inputClass} />
            </Field>
            <Field label="Canonical-Adresse (nur falls du weißt, was das ist)">
              <input name="canonicalUrl" defaultValue={settings.canonicalUrl || ""} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" name="robotsIndex" defaultChecked={settings.robotsIndex} /> Von Suchmaschinen
              gefunden werden lassen
            </label>
          </div>
        )}
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
