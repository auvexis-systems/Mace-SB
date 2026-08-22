"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { cardSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CardFormState = { error: string | null; fieldErrors?: Record<string, string> };

function parseCardForm(formData: FormData) {
  const tagsRaw = String(formData.get("tags") || "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  return cardSchema.safeParse({
    title: formData.get("title"),
    shortDesc: formData.get("shortDesc"),
    longDesc: formData.get("longDesc") || null,
    imageUrl: formData.get("imageUrl") || null,
    imageAlt: formData.get("imageAlt") || null,
    mediaIconKey: formData.get("mediaIconKey") || null,
    stylePreset: formData.get("stylePreset") || null,
    badge: formData.get("badge") || null,
    promoCode: formData.get("promoCode") || null,
    oldPrice: formData.get("oldPrice") || null,
    newPrice: formData.get("newPrice") || null,
    discountText: formData.get("discountText") || null,
    expiresAt: formData.get("expiresAt") || null,
    hint: formData.get("hint") || null,
    ctaText: formData.get("ctaText") || "Jetzt ansehen",
    ctaUrl: formData.get("ctaUrl"),
    ctaNewTab: formData.get("ctaNewTab") === "on",
    cta2Text: formData.get("cta2Text") || null,
    cta2Url: formData.get("cta2Url") || null,
    cta2NewTab: formData.get("cta2NewTab") === "on",
    tags,
    status: formData.get("status") || "DRAFT",
    featured: formData.get("featured") === "on",
    categoryId: formData.get("categoryId") || null,
  });
}

export async function createCardAction(
  _prev: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  await requireAdmin();
  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Bitte Eingaben pruefen.", fieldErrors };
  }

  const maxPos = await prisma.card.aggregate({ _max: { position: true } });
  const nextPos = (maxPos._max.position ?? -1) + 1;

  const { tags, categoryId, expiresAt, ...rest } = parsed.data;

  await prisma.card.create({
    data: {
      ...rest,
      categoryId: categoryId || null,
      tags: JSON.stringify(tags),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      position: nextPos,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/cards");
  redirect(`/admin/cards?${parsed.data.status === "PUBLISHED" ? "published" : "created"}=1`);
}

export async function updateCardAction(
  id: string,
  _prev: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  await requireAdmin();
  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Bitte Eingaben pruefen.", fieldErrors };
  }

  const { tags, categoryId, expiresAt, ...rest } = parsed.data;

  await prisma.card.update({
    where: { id },
    data: {
      ...rest,
      categoryId: categoryId || null,
      tags: JSON.stringify(tags),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/cards");
  redirect("/admin/cards?saved=1");
}

export async function deleteCardAction(id: string) {
  await requireAdmin();
  await prisma.card.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/cards");
}

export async function duplicateCardAction(id: string) {
  await requireAdmin();
  const original = await prisma.card.findUnique({ where: { id } });
  if (!original) return;

  const maxPos = await prisma.card.aggregate({ _max: { position: true } });
  const nextPos = (maxPos._max.position ?? -1) + 1;

  await prisma.card.create({
    data: {
      title: `${original.title} (Kopie)`,
      shortDesc: original.shortDesc,
      longDesc: original.longDesc,
      imageUrl: original.imageUrl,
      imageAlt: original.imageAlt,
      mediaIconKey: original.mediaIconKey,
      stylePreset: original.stylePreset,
      badge: original.badge,
      promoCode: original.promoCode,
      oldPrice: original.oldPrice,
      newPrice: original.newPrice,
      discountText: original.discountText,
      expiresAt: original.expiresAt,
      hint: original.hint,
      ctaText: original.ctaText,
      ctaUrl: original.ctaUrl,
      ctaNewTab: original.ctaNewTab,
      cta2Text: original.cta2Text,
      cta2Url: original.cta2Url,
      cta2NewTab: original.cta2NewTab,
      tags: original.tags,
      featured: original.featured,
      categoryId: original.categoryId,
      status: "DRAFT",
      position: nextPos,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/cards");
}

export async function toggleCardStatusAction(id: string, status: "PUBLISHED" | "DISABLED") {
  await requireAdmin();
  await prisma.card.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/admin/cards");
}

export async function toggleCardFeaturedAction(id: string, featured: boolean) {
  await requireAdmin();
  await prisma.card.update({ where: { id }, data: { featured } });
  revalidatePath("/");
  revalidatePath("/admin/cards");
}

export async function reorderCardsAction(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.card.update({ where: { id }, data: { position: index } })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/cards");
}

export async function moveCardAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const cards = await prisma.card.findMany({ orderBy: { position: "asc" } });
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= cards.length) return;

  const a = cards[idx];
  const b = cards[swapWith];
  await prisma.$transaction([
    prisma.card.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.card.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/cards");
}
