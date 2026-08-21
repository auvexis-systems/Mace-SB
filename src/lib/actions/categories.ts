"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "kategorie";
}

export type CategoryFormState = { error: string | null };

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || null,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: "Name ist erforderlich." };

  let slug = slugify(parsed.data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const maxPos = await prisma.category.aggregate({ _max: { position: true } });

  await prisma.category.create({
    data: {
      ...parsed.data,
      slug,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { error: null };
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || null,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: "Name ist erforderlich." };

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { error: null };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { position: index } })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/categories");
}
