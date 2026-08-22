import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/admin/media-library";
import { MEDIA_ASSET_GALLERY_SELECT } from "@/lib/media";

export const metadata = { title: "Medien" };

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: [{ isSystemAsset: "desc" }, { createdAt: "desc" }],
    select: MEDIA_ASSET_GALLERY_SELECT,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Medien</h1>
        <p className="text-sm text-white/50">Bilder für deine Angebote — Galerie oder eigener Upload.</p>
      </div>
      <MediaLibrary assets={assets} />
    </div>
  );
}
