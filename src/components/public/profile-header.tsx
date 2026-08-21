import Image from "next/image";
import { Flame, CheckCircle2 } from "lucide-react";
import { ShareButton } from "./share-button";
import { SocialIcon, PLATFORM_LABELS } from "./social-icon";
import { MaceLogo } from "./mace-logo";

type Profile = {
  brandName: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  description: string;
  noticeText: string | null;
  shareEnabled: boolean;
};

type SocialLink = { id: string; platform: string; url: string };

const TRUST_ITEMS = ["Beste Boni", "Sichere Anbieter", "Aktuelle Angebote", "Exklusive Vorteile"];

function BrandTitle({ brandName }: { brandName: string }) {
  if (brandName.startsWith("Mace") && brandName.length > 4) {
    const rest = brandName.slice(4);
    return (
      <>
        Mace
        <span className="msb-accent">{rest}</span>
      </>
    );
  }
  return <>{brandName}</>;
}

export function ProfileHeader({
  profile,
  socialLinks,
}: {
  profile: Profile;
  socialLinks: SocialLink[];
}) {
  const image = profile.avatarUrl || profile.logoUrl;

  return (
    <header className="flex flex-col gap-5 msb-animate-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {image ? (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1" style={{ borderColor: "var(--msb-accent)" }}>
              <Image src={image} alt={`${profile.brandName} Logo`} fill sizes="36px" className="object-cover" />
            </div>
          ) : (
            <MaceLogo size={36} />
          )}
          <span className="text-sm font-semibold msb-text-primary">{profile.brandName}</span>
        </div>

        <div className="flex items-center gap-3">
          {socialLinks.length > 0 && (
            <nav aria-label="Social Media Links" className="flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={PLATFORM_LABELS[link.platform] || link.platform}
                  className="msb-card msb-card-hoverable flex h-9 w-9 items-center justify-center rounded-full msb-text-primary"
                >
                  <SocialIcon platform={link.platform} className="w-4 h-4" />
                </a>
              ))}
            </nav>
          )}
          {profile.shareEnabled && <ShareButton title={profile.brandName} />}
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        {image ? (
          <div
            className="relative h-20 w-20 overflow-hidden rounded-full ring-2"
            style={{ borderColor: "var(--msb-accent)", boxShadow: "0 0 32px var(--msb-card-glow)" }}
          >
            <Image src={image} alt={`${profile.brandName} Logo`} fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ filter: "drop-shadow(0 0 24px var(--msb-card-glow))" }}
            aria-hidden="true"
          >
            <MaceLogo size={72} />
          </div>
        )}

        <h1
          className="mt-3 text-4xl font-extrabold tracking-tight msb-text-primary sm:text-[64px] sm:leading-[1.05]"
          style={{ textShadow: "0 0 40px var(--msb-card-glow)" }}
        >
          <BrandTitle brandName={profile.brandName} />
        </h1>

        {profile.description && (
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed msb-text-secondary">
            {profile.description}
          </p>
        )}

        {profile.noticeText && (
          <span
            className="mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold msb-text-primary"
            style={{
              background: "linear-gradient(90deg, var(--msb-accent), var(--msb-accent-2))",
              boxShadow: "0 0 24px var(--msb-card-glow)",
            }}
          >
            <Flame className="h-3.5 w-3.5" />
            {profile.noticeText}
          </span>
        )}

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm msb-text-secondary">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 msb-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
