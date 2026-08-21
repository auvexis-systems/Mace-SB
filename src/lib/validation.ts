import { z } from "zod";
import { isSafeUrl } from "./url";

const safeUrl = z
  .string()
  .trim()
  .min(1, "URL ist erforderlich")
  .refine(isSafeUrl, "Ungueltige oder unsichere URL (nur http/https erlaubt)");

const optionalSafeUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isSafeUrl(v), "Ungueltige oder unsichere URL");

export const cardSchema = z.object({
  title: z.string().trim().min(1, "Titel ist erforderlich").max(120),
  shortDesc: z.string().trim().min(1, "Kurzbeschreibung ist erforderlich").max(240),
  longDesc: z.string().trim().max(4000).optional().nullable(),
  imageUrl: z.string().trim().max(2048).optional().nullable(),
  imageAlt: z.string().trim().max(200).optional().nullable(),
  badge: z.string().trim().max(40).optional().nullable(),
  promoCode: z.string().trim().max(60).optional().nullable(),
  oldPrice: z.string().trim().max(40).optional().nullable(),
  newPrice: z.string().trim().max(40).optional().nullable(),
  discountText: z.string().trim().max(60).optional().nullable(),
  expiresAt: z.string().trim().optional().nullable(),
  hint: z.string().trim().max(300).optional().nullable(),

  ctaText: z.string().trim().min(1).max(60).default("Jetzt ansehen"),
  ctaUrl: safeUrl,
  ctaNewTab: z.boolean().default(true),
  cta2Text: z.string().trim().max(60).optional().nullable(),
  cta2Url: optionalSafeUrl,
  cta2NewTab: z.boolean().default(true),

  tags: z.array(z.string().trim().max(30)).max(10).default([]),

  status: z.enum(["DRAFT", "PUBLISHED", "DISABLED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  categoryId: z.string().trim().optional().nullable(),
});

export type CardInput = z.infer<typeof cardSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich").max(60),
  color: z.string().trim().max(20).optional().nullable(),
  active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const socialLinkSchema = z.object({
  platform: z.enum([
    "instagram",
    "tiktok",
    "youtube",
    "x",
    "twitch",
    "discord",
    "telegram",
    "facebook",
    "website",
    "email",
  ]),
  url: z.string().trim().min(1).max(2048),
  active: z.boolean().default(true),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export const profileSchema = z.object({
  brandName: z.string().trim().min(1).max(80),
  description: z.string().trim().max(400),
  noticeText: z.string().trim().max(300).optional().nullable(),
  shareEnabled: z.boolean().default(true),
  publicClicksVisible: z.boolean().default(false),
  searchEnabled: z.boolean().default(true),
  seoTitle: z.string().trim().max(120).optional().nullable(),
  seoDescription: z.string().trim().max(300).optional().nullable(),
  canonicalUrl: z.string().trim().max(300).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  impressumText: z.string().trim().max(20000).optional().nullable(),
  datenschutzText: z.string().trim().max(20000).optional().nullable(),
  affiliateText: z.string().trim().max(20000).optional().nullable(),
  kontaktText: z.string().trim().max(20000).optional().nullable(),
  disclaimerText: z.string().trim().max(20000).optional().nullable(),
  showImpressumLink: z.boolean().default(true),
  showDatenschutzLink: z.boolean().default(true),
  showAffiliateLink: z.boolean().default(true),
  showKontaktLink: z.boolean().default(true),
  showDisclaimerLink: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Benutzername oder E-Mail erforderlich"),
  password: z.string().min(1, "Passwort erforderlich"),
});
