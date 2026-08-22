"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, Trash2, Check, Loader2, ImageOff } from "lucide-react";
import Image from "next/image";
import { MEDIA_CATEGORIES } from "@/lib/media";
import { MediaMotifIcon } from "@/components/public/media-icon";
import { uploadMediaAction, deleteMediaAssetAction, type UploadMediaState } from "@/lib/actions/media";
import { useToast } from "./toast-provider";
import { useConfirm } from "./confirm-dialog";

export type MediaAssetItem = {
  id: string;
  name: string;
  category: string;
  fileUrl: string | null;
  iconKey: string | null;
  accent: string;
  isSystemAsset: boolean;
};

export type SelectedMedia = { imageUrl: string | null; mediaIconKey: string | null };

const accentVar = (accent: string) =>
  accent === "accent2" ? "var(--msb-accent-2)" : accent === "featured" ? "var(--msb-featured)" : "var(--msb-accent)";

// Matches the gallery grid's actual column counts (grid-cols-2 / sm:3 / md:4)
// so the browser requests an image close to its real rendered size instead
// of defaulting to a full-viewport-width guess for `fill` images.
const GALLERY_IMAGE_SIZES = "(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

function AssetTile({
  asset,
  onSelect,
  onDelete,
}: {
  asset: MediaAssetItem;
  onSelect?: (media: SelectedMedia) => void;
  onDelete?: (id: string) => void;
}) {
  const color = accentVar(asset.accent);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-black/30">
        {asset.fileUrl ? (
          <>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}
            <Image
              src={asset.fileUrl}
              alt={asset.name}
              fill
              sizes={GALLERY_IMAGE_SIZES}
              className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <MediaMotifIcon iconKey={asset.iconKey} className="h-10 w-10" style={{ color, filter: `drop-shadow(0 0 12px ${color})` }} />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2.5">
        <span className="truncate text-xs font-medium text-white/70">{asset.name}</span>
        {!asset.isSystemAsset && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(asset.id)}
            aria-label="Löschen"
            className="shrink-0 rounded-md p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect({ imageUrl: asset.fileUrl, mediaIconKey: asset.iconKey })}
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5">
            <Check className="h-4 w-4" /> Verwenden
          </span>
        </button>
      )}
    </div>
  );
}

function UploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  async function handleFile(file: File) {
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("name", file.name.replace(/\.[a-zA-Z0-9]+$/, ""));
    fd.set("category", "sonstiges");
    const initial: UploadMediaState = { error: null };
    const result = await uploadMediaAction(initial, fd);
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      showToast("Bild hochgeladen ✓");
      onUploaded();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-8 text-sm text-white/50 cursor-pointer hover:bg-white/10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        {pending ? "Wird hochgeladen…" : "Bild hierher ziehen oder klicken (JPG, PNG, WEBP, max. 5 MB)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function MediaLibrary({
  assets,
  onSelect,
}: {
  assets: MediaAssetItem[];
  /** Picker mode: pass this to render "Verwenden" instead of a management UI. */
  onSelect?: (media: SelectedMedia) => void;
}) {
  const [category, setCategory] = useState("alle");
  const [items, setItems] = useState(assets);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const filtered = useMemo(
    () => (category === "alle" ? items : items.filter((a) => a.category === category)),
    [items, category]
  );

  const ownUploads = items.filter((a) => !a.isSystemAsset);

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Bild wirklich löschen?",
      description: "Das Bild wird dauerhaft entfernt. Angebote, die es verwenden, zeigen danach kein Bild mehr.",
      confirmLabel: "Endgültig löschen",
      danger: true,
    });
    if (!ok) return;
    setItems((list) => list.filter((a) => a.id !== id));
    await deleteMediaAssetAction(id);
    showToast("Bild gelöscht ✓");
  }

  return (
    <div className="flex flex-col gap-6">
      {!onSelect && (
        <UploadZone
          onUploaded={() => {
            // A full reload keeps this simple component free of extra fetch logic;
            // Next.js revalidation already refreshes the server-rendered list.
            window.location.reload();
          }}
        />
      )}

      <div className="flex gap-2 overflow-x-auto msb-no-scrollbar pb-1">
        {MEDIA_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === c.key ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          <ImageOff className="mx-auto mb-2 h-8 w-8 text-white/20" />
          {onSelect ? "Keine Bilder in dieser Kategorie." : "Noch keine eigenen Bilder hochgeladen."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((asset) => (
            <AssetTile
              key={asset.id}
              asset={asset}
              onSelect={onSelect}
              onDelete={!onSelect ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {!onSelect && ownUploads.length === 0 && (
        <p className="text-xs text-white/30">
          Tipp: Alles über &bdquo;Galerie&ldquo; oben ist ein vorbereitetes Motiv. Eigene Bilder erscheinen hier,
          sobald du eines hochgeladen hast.
        </p>
      )}
    </div>
  );
}
