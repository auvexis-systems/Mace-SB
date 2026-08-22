"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { updateProfileAction, type ProfileFormState } from "@/lib/actions/profile";
import { uploadImageAction, type UploadState } from "@/lib/actions/upload";
import { useToast } from "./toast-provider";

type Profile = {
  brandName: string;
  description: string;
  noticeText: string | null;
  avatarUrl: string | null;
  shareEnabled: boolean;
  publicClicksVisible: boolean;
  searchEnabled: boolean;
};

const initialState: ProfileFormState = { error: null };
const uploadInitial: UploadState = { url: null, error: null };

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

function LogoUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImageAction(uploadInitial, fd);
    setPending(false);
    if (result.url) onChange(result.url);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-white/60">Logo</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
            <Image src={value} alt="Logo" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Logo entfernen"
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 text-white/30">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </div>
        )}
        <label className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
          {value ? "Logo ändern" : "Logo hochladen"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input type="hidden" name="avatarUrl" value={value ?? ""} />
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [logoUrl, setLogoUrl] = useState<string | null>(profile.avatarUrl);
  const { showToast } = useToast();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      showToast("Website-Infos gespeichert ✓");
    }
    wasPending.current = pending;
  }, [pending, state.error, showToast]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">Marke</h3>
        <Field label="Name deiner Website *">
          <input name="brandName" required defaultValue={profile.brandName} className={inputClass} />
        </Field>
        <Field label="Beschreibung">
          <textarea name="description" rows={2} defaultValue={profile.description} className={inputClass} />
        </Field>
        <LogoUpload value={logoUrl} onChange={setLogoUrl} />
        <Field label="Hinweistext (kleines Badge über deinen Angeboten)">
          <input name="noticeText" defaultValue={profile.noticeText || ""} className={inputClass} />
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/80">Funktionen</h3>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="shareEnabled" defaultChecked={profile.shareEnabled} /> Teilen-Button anzeigen
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="searchEnabled" defaultChecked={profile.searchEnabled} /> Suche anzeigen
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="publicClicksVisible" defaultChecked={profile.publicClicksVisible} /> Klickzahlen öffentlich anzeigen
        </label>
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
