"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { socialLinkSchema } from "@/lib/validation";
import { isSafeUrl } from "@/lib/url";
import { revalidatePath } from "next/cache";

export type SocialFormState = { error: string | null };

export async function upsertSocialLinkAction(
  id: string | null,
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  await requireAdmin();
  const platform = String(formData.get("platform") || "");
  const rawUrl = String(formData.get("url") || "").trim();

  const url = platform === "email" && !rawUrl.startsWith("mailto:") ? `mailto:${rawUrl}` : rawUrl;

  const parsed = socialLinkSchema.safeParse({
    platform,
    url,
    active: formData.get("active") === "on",
  });
  if (!parsed.success || !isSafeUrl(parsed.data.url)) {
    return { error: "Bitte gueltige Plattform und URL angeben." };
  }

  if (id) {
    await prisma.socialLink.update({ where: { id }, data: parsed.data });
  } else {
    const maxPos = await prisma.socialLink.aggregate({ _max: { position: true } });
    await prisma.socialLink.create({
      data: { ...parsed.data, position: (maxPos._max.position ?? -1) + 1 },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { error: null };
}

export async function deleteSocialLinkAction(id: string) {
  await requireAdmin();
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/profile");
}
