import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata = { title: "Kategorien" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Kategorien</h1>
        <p className="text-sm text-white/50">Verwalten Sie die Kategorien Ihrer Angebote.</p>
      </div>
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          active: c.active,
          cardCount: c._count.cards,
        }))}
      />
    </div>
  );
}
