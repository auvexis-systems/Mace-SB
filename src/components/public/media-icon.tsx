import { MEDIA_ICON_REGISTRY, type MediaIconKey } from "@/lib/media";
import { Trophy } from "lucide-react";

/**
 * Wraps the icon-key → component lookup in its own component (mirrors
 * SocialIcon) so React's static-components check doesn't flag callers that
 * derive an icon dynamically and render it inline. Note: a direct object
 * lookup (not a function call) is what keeps the lint rule happy here.
 */
export function MediaMotifIcon({
  iconKey,
  className,
  style,
}: {
  iconKey: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = MEDIA_ICON_REGISTRY[(iconKey as MediaIconKey) || "trophy"] || Trophy;
  return <Icon className={className} style={style} aria-hidden="true" />;
}
