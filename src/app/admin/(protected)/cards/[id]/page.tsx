import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardForm, type CardFormValues } from "@/components/admin/card-form";
import { parseTags } from "@/lib/data";

export const metadata = { title: "Card bearbeiten" };

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [card, categories] = await Promise.all([
    prisma.card.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!card) notFound();

  const initial: CardFormValues = {
    id: card.id,
    title: card.title,
    shortDesc: card.shortDesc,
    longDesc: card.longDesc || "",
    imageUrl: card.imageUrl,
    imageAlt: card.imageAlt || "",
    badge: card.badge || "",
    promoCode: card.promoCode || "",
    oldPrice: card.oldPrice || "",
    newPrice: card.newPrice || "",
    discountText: card.discountText || "",
    expiresAt: card.expiresAt ? card.expiresAt.toISOString().slice(0, 10) : "",
    hint: card.hint || "",
    ctaText: card.ctaText,
    ctaUrl: card.ctaUrl,
    ctaNewTab: card.ctaNewTab,
    cta2Text: card.cta2Text || "",
    cta2Url: card.cta2Url || "",
    cta2NewTab: card.cta2NewTab,
    tags: parseTags(card.tags).join(", "),
    status: card.status,
    featured: card.featured,
    categoryId: card.categoryId || "",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Card bearbeiten</h1>
        <p className="text-sm text-white/50">{card.title}</p>
      </div>
      <CardForm initial={initial} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
