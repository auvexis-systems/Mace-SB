"use client";

import { useState } from "react";
import { Images, Upload } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { MediaLibrary, type MediaAssetItem, type SelectedMedia } from "@/components/admin/media-library";

export function ImagePicker({
  imageUrl,
  mediaIconKey,
  imageAlt,
  onAltChange,
  onSelect,
  mediaAssets,
}: {
  imageUrl: string | null;
  mediaIconKey: string | null;
  imageAlt: string;
  onAltChange: (v: string) => void;
  onSelect: (media: SelectedMedia) => void;
  mediaAssets: MediaAssetItem[];
}) {
  const [tab, setTab] = useState<"gallery" | "upload">(imageUrl ? "upload" : "gallery");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
            tab === "gallery" ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Images className="h-3.5 w-3.5" /> Galerie
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
            tab === "upload" ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> Eigenes Bild hochladen
        </button>
      </div>

      {tab === "gallery" ? (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 p-3">
          <MediaLibrary assets={mediaAssets} onSelect={onSelect} />
        </div>
      ) : (
        <ImageUpload
          value={imageUrl}
          onChange={(url) => onSelect({ imageUrl: url, mediaIconKey: null })}
          altValue={imageAlt}
          onAltChange={onAltChange}
        />
      )}

      {mediaIconKey && !imageUrl && (
        <p className="text-xs text-white/40">Motiv aus der Galerie ausgewählt.</p>
      )}
    </div>
  );
}
