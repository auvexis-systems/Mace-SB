import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata = { title: "Medien" };

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: [{ isSystemAsset: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Medien</h1>
        <p className="text-sm text-white/50">Bilder für deine Angebote — Galerie oder eigener Upload.</p>
      </div>
      <MediaLibrary
        assets={assets.map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          fileUrl: a.fileUrl,
          iconKey: a.iconKey,
          accent: a.accent,
          isSystemAsset: a.isSystemAsset,
        }))}
      />
    </div>
  );
}
