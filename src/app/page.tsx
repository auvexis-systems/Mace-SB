import Link from "next/link";
import {
  getProfile,
  getPublicCards,
  getActiveCategories,
  getActiveSocialLinks,
  getDesignConfig,
  parseTags,
} from "@/lib/data";
import { designToCssVars } from "@/lib/design";
import { ProfileHeader } from "@/components/public/profile-header";
import { OffersExplorer } from "@/components/public/offers-explorer";
import type { PublicCardData } from "@/components/public/offer-card";
import { CasinoScene } from "@/components/public/casino-scene";
import { ParticleField } from "@/components/public/particle-field";
import { BackToTop } from "@/components/public/back-to-top";

export default async function HomePage() {
  const [profile, cards, categories, socialLinks, design] = await Promise.all([
    getProfile(),
    getPublicCards(),
    getActiveCategories(),
    getActiveSocialLinks(),
    getDesignConfig(),
  ]);

  const cssVars = designToCssVars(design) as React.CSSProperties;

  const publicCards: PublicCardData[] = cards.map((c) => ({
    id: c.id,
    title: c.title,
    shortDesc: c.shortDesc,
    longDesc: c.longDesc,
    imageUrl: c.imageUrl,
    imageAlt: c.imageAlt,
    mediaIconKey: c.mediaIconKey,
    stylePreset: c.stylePreset,
    badge: c.badge,
    promoCode: c.promoCode,
    oldPrice: c.oldPrice,
    newPrice: c.newPrice,
    discountText: c.discountText,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    hint: c.hint,
    ctaText: c.ctaText,
    cta2Text: c.cta2Text,
    cta2Url: c.cta2Url,
    cta2NewTab: c.cta2NewTab,
    tags: parseTags(c.tags),
    featured: c.featured,
    category: c.category ? { id: c.category.id, name: c.category.name, color: c.category.color } : null,
    clickCount: c._count.clicks,
  }));

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  const motionEnabled = design.animationsEnabled;
  const casinoEnabled = motionEnabled && design.casinoBackgroundEnabled;
  const particlesEnabled = motionEnabled && design.particlesEnabled;

  const footerLinks = [
    profile.showImpressumLink && { href: "/impressum", label: "Impressum" },
    profile.showDatenschutzLink && { href: "/datenschutz", label: "Datenschutz" },
    profile.showAffiliateLink && { href: "/affiliate-hinweis", label: "Affiliate-Hinweis" },
    profile.showKontaktLink && { href: "/kontakt", label: "Kontakt" },
    profile.showDisclaimerLink && { href: "/disclaimer", label: "Hinweis" },
  ].filter((l): l is { href: string; label: string } => Boolean(l));

  return (
    <div className="msb-page" style={cssVars}>
      <CasinoScene enabled={casinoEnabled} parallaxStrength={design.parallaxStrength} />
      <ParticleField enabled={particlesEnabled} intensity={design.particleIntensity} />

      <main
        className="relative z-10 mx-auto flex w-full flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 sm:pt-10"
        style={{ maxWidth: "var(--msb-max-width)" }}
      >
        <ProfileHeader profile={profile} socialLinks={socialLinks} />

        <OffersExplorer
          cards={publicCards}
          categories={categoryOptions}
          searchEnabled={profile.searchEnabled}
          showClicks={profile.publicClicksVisible}
        />

        {footerLinks.length > 0 && (
          <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs msb-text-secondary">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ))}
          </footer>
        )}
      </main>

      <BackToTop />
    </div>
  );
}
