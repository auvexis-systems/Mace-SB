import Image from "next/image";
import { ExternalLink, Clock, MousePointerClick, Trophy, Star, Dices, Crown, type LucideIcon } from "lucide-react";
import { CopyCodeButton } from "./copy-code-button";
import { getCardStyle } from "@/lib/card-styles";
import { MediaMotifIcon } from "./media-icon";

export type PublicCardData = {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  mediaIconKey: string | null;
  stylePreset: string | null;
  badge: string | null;
  promoCode: string | null;
  oldPrice: string | null;
  newPrice: string | null;
  discountText: string | null;
  expiresAt: string | null;
  hint: string | null;
  ctaText: string;
  cta2Text: string | null;
  cta2Url: string | null;
  cta2NewTab: boolean;
  tags: string[];
  featured: boolean;
  category: { id: string; name: string; color: string | null } | null;
  clickCount?: number;
};

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

type Accent = { icon: LucideIcon; colorVar: string };

// Decorative fallback visual (icon + tinted gradient) for cards without an
// uploaded image, cycling through a small generic set — trophy / star / dice
// / crown — so every card still gets a large visual banner.
const ACCENTS: Accent[] = [
  { icon: Trophy, colorVar: "--msb-accent" },
  { icon: Star, colorVar: "--msb-accent-2" },
  { icon: Dices, colorVar: "--msb-accent" },
  { icon: Crown, colorVar: "--msb-featured" },
];

/** Renders the chosen media motif, or the position-based fallback icon if none was set. */
function BannerIcon({
  mediaIconKey,
  fallback: Fallback,
  className,
  style,
}: {
  mediaIconKey: string | null;
  fallback: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (mediaIconKey) return <MediaMotifIcon iconKey={mediaIconKey} className={className} style={style} />;
  return <Fallback className={className} style={style} aria-hidden="true" />;
}

export function OfferCard({
  card,
  showClicks,
  accentIndex = 0,
}: {
  card: PublicCardData;
  showClicks: boolean;
  accentIndex?: number;
}) {
  const positionAccent = ACCENTS[accentIndex % ACCENTS.length];
  const accentColor = card.stylePreset ? getCardStyle(card.stylePreset).accent : `var(${positionAccent.colorVar})`;

  return (
    <article
      className={`msb-card msb-card-hoverable relative flex h-full flex-col overflow-hidden ${
        card.featured ? "msb-card-featured" : ""
      }`}
      style={
        {
          "--msb-card-accent": accentColor,
          "--msb-card-border": `color-mix(in srgb, ${accentColor} 45%, transparent)`,
          "--msb-card-glow": `color-mix(in srgb, ${accentColor} 55%, transparent)`,
        } as React.CSSProperties
      }
    >
      <div className="msb-card-banner relative w-full overflow-hidden">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.imageAlt || card.title}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="msb-card-image object-cover"
          />
        ) : (
          <div
            className="msb-card-banner-fallback flex h-full w-full items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${accentColor} 35%, transparent), transparent 70%)` }}
            aria-hidden="true"
          >
            <BannerIcon
              mediaIconKey={card.mediaIconKey}
              fallback={positionAccent.icon}
              className="msb-card-banner-icon"
              style={{ color: accentColor, filter: `drop-shadow(0 0 22px ${accentColor})` }}
            />
          </div>
        )}
        {card.badge && (
          <span
            className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
            style={{ background: accentColor, boxShadow: `0 0 16px ${accentColor}` }}
          >
            {card.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-xl font-bold msb-text-primary">{card.title}</h3>
          <p className="mt-1 text-sm msb-text-secondary">{card.shortDesc}</p>
        </div>

        {card.longDesc && <p className="text-sm msb-text-secondary">{card.longDesc}</p>}

        {(card.oldPrice || card.newPrice || card.discountText) && (
          <div className="flex items-center gap-2 flex-wrap">
            {card.oldPrice && (
              <span className="text-sm line-through msb-text-secondary">{card.oldPrice}</span>
            )}
            {card.newPrice && (
              <span className="text-base font-bold" style={{ color: accentColor }}>
                {card.newPrice}
              </span>
            )}
            {card.discountText && (
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold msb-text-primary">
                {card.discountText}
              </span>
            )}
          </div>
        )}

        {card.promoCode && <CopyCodeButton code={card.promoCode} />}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-xs msb-text-secondary"
                style={{ border: "1px solid var(--msb-card-border)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {card.hint && <p className="text-xs msb-text-secondary italic">{card.hint}</p>}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <a
            href={`/go/${card.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="msb-btn-shine flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold min-h-11 text-white"
            style={{
              background: accentColor,
              borderRadius: "var(--msb-button-radius)",
              boxShadow: `0 0 20px ${accentColor}`,
            }}
          >
            {card.ctaText}
            <ExternalLink className="w-4 h-4" />
          </a>
          {card.cta2Text && card.cta2Url && (
            <a
              href={card.cta2Url}
              target={card.cta2NewTab ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium msb-text-primary rounded-xl min-h-11"
              style={{ border: "1px solid var(--msb-card-border)" }}
            >
              {card.cta2Text}
            </a>
          )}
        </div>

        <div className="flex items-center justify-between text-xs msb-text-secondary">
          {card.expiresAt ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> gueltig bis {formatExpiry(card.expiresAt)}
            </span>
          ) : (
            <span />
          )}
          {showClicks && typeof card.clickCount === "number" && (
            <span className="flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5" /> {card.clickCount}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
