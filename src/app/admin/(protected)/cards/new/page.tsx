import { prisma } from "@/lib/prisma";
import { CardWizard } from "@/components/admin/card-wizard";
import { MEDIA_ASSET_GALLERY_SELECT } from "@/lib/media";

export const metadata = { title: "Neues Angebot" };

export default async function NewCardPage() {
  const [categories, mediaAssets] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: "asc" } }),
    prisma.mediaAsset.findMany({
      orderBy: [{ isSystemAsset: "desc" }, { createdAt: "desc" }],
      select: MEDIA_ASSET_GALLERY_SELECT,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Neues Angebot</h1>
        <p className="text-sm text-white/50">In wenigen Schritten zu deinem neuen Angebot.</p>
      </div>
      <CardWizard
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
