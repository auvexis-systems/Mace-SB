import { prisma } from "@/lib/prisma";
import { parseDesignConfig, DEFAULT_DESIGN } from "@/lib/design";

export async function getProfile() {
  const profile = await prisma.profileSettings.findUnique({ where: { id: "singleton" } });
  if (!profile) {
    return {
      id: "singleton",
      brandName: "MaceSlotsBonus",
      logoUrl: null,
      avatarUrl: null,
      description: "",
      noticeText: null,
      shareEnabled: true,
      publicClicksVisible: false,
      searchEnabled: true,
      seoTitle: null,
      seoDescription: null,
      ogImageUrl: null,
      canonicalUrl: null,
      robotsIndex: true,
      impressumText: null,
      datenschutzText: null,
      affiliateText: null,
      kontaktText: null,
      disclaimerText: null,
      showImpressumLink: true,
      showDatenschutzLink: true,
      showAffiliateLink: true,
      showKontaktLink: true,
      showDisclaimerLink: true,
      designConfig: JSON.stringify(DEFAULT_DESIGN),
      activeThemeId: null,
      updatedAt: new Date(),
    };
  }
  return profile;
}

export async function getDesignConfig() {
  const profile = await getProfile();
  return parseDesignConfig(profile.designConfig);
}

export async function getPublicCards() {
  return prisma.card.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true, _count: { select: { clicks: true } } },
    orderBy: { position: "asc" },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });
}

export async function getActiveSocialLinks() {
  return prisma.socialLink.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });
}

export function parseTags(tags: string): string[] {
  try {
    const arr = JSON.parse(tags);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
