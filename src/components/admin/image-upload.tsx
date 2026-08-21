"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { uploadImageAction, type UploadState } from "@/lib/actions/upload";

const initialState: UploadState = { url: null, error: null };

export function ImageUpload({
  value,
  onChange,
  altValue,
  onAltChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  altValue: string;
  onAltChange: (alt: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadImageAction(initialState, fd);
    setPending(false);
    if (result.url) onChange(result.url);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <Image src={value} alt={altValue || "Vorschau"} fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Bild entfernen"
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-8 text-sm text-white/50 cursor-pointer hover:bg-white/10">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          {pending ? "Wird hochgeladen…" : "Bild hochladen (PNG, JPG, WEBP, max. 5 MB)"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <input type="hidden" name="imageUrl" value={value ?? ""} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="imageAlt" className="text-xs text-white/50">
          Alt-Text (Bildbeschreibung)
        </label>
        <input
          id="imageAlt"
          name="imageAlt"
          value={altValue}
          onChange={(e) => onAltChange(e.target.value)}
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-400"
        />
      </div>
    </div>
  );
}
