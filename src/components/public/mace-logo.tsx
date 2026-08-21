/**
 * Generic monogram mark: a stylised "M" with a subtle spade notch cut into
 * the center peak. Deliberately abstract — no card-suit clipart, no borrowed
 * brand marks.
 */
export function MaceLogo({ size = 44, className }: { size?: number; className?: string }) {
  const gradientId = "msb-logo-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="MaceSlotsBonus Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--msb-accent, #7c5cff)" />
          <stop offset="100%" stopColor="var(--msb-accent-2, #ff5ec4)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill={`url(#${gradientId})`} opacity="0.14" />
      <rect x="1" y="1" width="46" height="46" rx="14" stroke={`url(#${gradientId})`} strokeWidth="1.5" opacity="0.6" />
      <path
        d="M11 34V16.5C11 15.1 12.6 14.3 13.7 15.1L24 22.5L34.3 15.1C35.4 14.3 37 15.1 37 16.5V34"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 20.5C24 20.5 20 24.5 20 27.3C20 29.2 21.6 30.7 23.5 30.5C23.7 32 22.8 33 21.6 33.6H26.4C25.2 33 24.3 32 24.5 30.5C26.4 30.7 28 29.2 28 27.3C28 24.5 24 20.5 24 20.5Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
