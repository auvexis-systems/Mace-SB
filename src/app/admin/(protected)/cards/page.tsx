import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CardsTable } from "@/components/admin/cards-table";

export const metadata = { title: "Cards" };

export default async function AdminCardsPage() {
  const cards = await prisma.card.findMany({
    include: { category: true, _count: { select: { clicks: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cards</h1>
          <p className="text-sm text-white/50">{cards.length} Cards insgesamt.</p>
        </div>
        <Link
          href="/admin/cards/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
        >
          <Plus className="w-4 h-4" /> Neue Card
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Noch keine Cards vorhanden.
        </div>
      ) : (
        <CardsTable
          cards={cards.map((c) => ({
            id: c.id,
            title: c.title,
            imageUrl: c.imageUrl,
            categoryName: c.category?.name ?? null,
            status: c.status,
            featured: c.featured,
            clicks: c._count.clicks,
            position: c.position,
          }))}
        />
      )}
    </div>
  );
}
