import {
  Camera,
  Video,
  Music,
  Hash,
  Radio,
  Send,
  MessageCircle,
  Globe,
  Mail,
  type LucideIcon,
} from "lucide-react";

// lucide-react no longer ships brand/logo marks, so each platform maps to
// the closest neutral, generic icon instead of a brand-specific glyph.
const ICONS: Record<string, LucideIcon> = {
  instagram: Camera,
  tiktok: Music,
  youtube: Video,
  x: Hash,
  twitch: Radio,
  discord: MessageCircle,
  telegram: Send,
  facebook: Globe,
  website: Globe,
  email: Mail,
};

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  twitch: "Twitch",
  discord: "Discord",
  telegram: "Telegram",
  facebook: "Facebook",
  website: "Website",
  email: "E-Mail",
};

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = ICONS[platform] || Globe;
  return <Icon className={className} aria-hidden="true" />;
}
