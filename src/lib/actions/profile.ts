"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { profileSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { DEFAULT_DESIGN, type DesignConfig, parseDesignConfig } from "@/lib/design";

export type ProfileFormState = { error: string | null };

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  await requireAdmin();

  const parsed = profileSchema.safeParse({
    brandName: formData.get("brandName"),
    description: formData.get("description"),
    noticeText: formData.get("noticeText") || null,
    shareEnabled: formData.get("shareEnabled") === "on",
    publicClicksVisible: formData.get("publicClicksVisible") === "on",
    searchEnabled: formData.get("searchEnabled") === "on",
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
    canonicalUrl: formData.get("canonicalUrl") || null,
    robotsIndex: formData.get("robotsIndex") === "on",
    impressumText: formData.get("impressumText") || null,
    datenschutzText: formData.get("datenschutzText") || null,
    affiliateText: formData.get("affiliateText") || null,
    kontaktText: formData.get("kontaktText") || null,
    disclaimerText: formData.get("disclaimerText") || null,
    showImpressumLink: formData.get("showImpressumLink") === "on",
    showDatenschutzLink: formData.get("showDatenschutzLink") === "on",
    showAffiliateLink: formData.get("showAffiliateLink") === "on",
    showKontaktLink: formData.get("showKontaktLink") === "on",
    showDisclaimerLink: formData.get("showDisclaimerLink") === "on",
  });

  if (!parsed.success) return { error: "Bitte Eingaben pruefen." };

  const logoUrl = formData.get("logoUrl");
  const avatarUrl = formData.get("avatarUrl");

  await prisma.profileSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...parsed.data,
      logoUrl: logoUrl ? String(logoUrl) : undefined,
      avatarUrl: avatarUrl ? String(avatarUrl) : undefined,
    },
    create: {
      id: "singleton",
      ...parsed.data,
      logoUrl: logoUrl ? String(logoUrl) : null,
      avatarUrl: avatarUrl ? String(avatarUrl) : null,
      designConfig: JSON.stringify(DEFAULT_DESIGN),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { error: null };
}

export async function updateDesignAction(design: DesignConfig, themeId: string | null) {
  await requireAdmin();
  await prisma.profileSettings.upsert({
    where: { id: "singleton" },
    update: { designConfig: JSON.stringify(design), activeThemeId: themeId },
    create: {
      id: "singleton",
      designConfig: JSON.stringify(design),
      activeThemeId: themeId,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/design");
}

export async function applyThemePresetAction(themeId: string) {
  await requireAdmin();
  const theme = await prisma.themePreset.findUnique({ where: { id: themeId } });
  if (!theme) return;
  const config = parseDesignConfig(theme.config);
  await updateDesignAction(config, themeId);
}
