import Link from "next/link";
import { Suspense } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OffersGrid } from "@/components/admin/offers-grid";
import { ToastFromQuery } from "@/components/admin/toast-from-query";

export const metadata = { title: "Angebote" };

export default async function AdminCardsPage() {
  const cards = await prisma.card.findMany({
    include: { category: true, _count: { select: { clicks: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <ToastFromQuery />
      </Suspense>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Angebote</h1>
          <p className="text-sm text-white/50">{cards.length} Angebote insgesamt.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            <FolderKanban className="w-4 h-4" /> Kategorien
          </Link>
          <Link
            href="/admin/cards/new"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
          >
            <Plus className="w-4 h-4" /> Neues Angebot
          </Link>
        </div>
      </div>

      <OffersGrid
        offers={cards.map((c) => ({
          id: c.id,
          title: c.title,
          imageUrl: c.imageUrl,
          mediaIconKey: c.mediaIconKey,
          categoryName: c.category?.name ?? null,
          status: c.status,
          featured: c.featured,
          clicks: c._count.clicks,
          position: c.position,
        }))}
      />
    </div>
  );
}
