"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePrefersReducedMotion, useIsCoarsePointer, useMediaQuery } from "@/lib/hooks/use-media";
import { clamp, parallaxRangeFor } from "@/lib/motion";

// Fixed precision keeps server- and client-rendered SVG coordinates
// byte-identical — raw Math.sin()/Math.cos() output can differ in the last
// float digit between environments and trips a hydration mismatch.
const round = (value: number) => Number(value.toFixed(4));

type SceneObject = {
  id: string;
  kind: "card" | "chip" | "die" | "slotmachine" | "crown" | "spade";
  suit?: "spade" | "heart";
  top: string;
  left?: string;
  right?: string;
  width: number;
  height: number;
  depth: number; // 0 (far, slow) - 1 (near, reacts more)
  rotate: number;
  glow: "accent" | "accent2" | "featured";
  floatDuration: number;
  floatDelay: number;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
};

const SCENE_OBJECTS: SceneObject[] = [
  // Left cluster — large overlapping playing cards, partially off-viewport.
  { id: "card-l1", kind: "card", suit: "spade", top: "10%", left: "-6%", width: 220, height: 308, depth: 0.18, rotate: -16, glow: "accent", floatDuration: 15, floatDelay: 0, hideOnMobile: true },
  { id: "card-l2", kind: "card", suit: "heart", top: "16%", left: "6%", width: 190, height: 266, depth: 0.24, rotate: -4, glow: "accent2", floatDuration: 12, floatDelay: 0.8, hideOnMobile: true },
  { id: "card-l3", kind: "card", suit: "spade", top: "26%", left: "1%", width: 170, height: 238, depth: 0.3, rotate: 10, glow: "accent", floatDuration: 13, floatDelay: 1.6, hideOnTablet: true },
  { id: "chip-l1", kind: "chip", top: "58%", left: "2%", width: 96, height: 96, depth: 0.42, rotate: 0, glow: "accent", floatDuration: 8, floatDelay: 0.4 },
  { id: "chip-l2", kind: "chip", top: "68%", left: "12%", width: 68, height: 68, depth: 0.55, rotate: 0, glow: "accent2", floatDuration: 6.5, floatDelay: 1.2, hideOnMobile: true },
  { id: "spade-l", kind: "spade", top: "82%", left: "8%", width: 46, height: 46, depth: 0.6, rotate: -8, glow: "accent", floatDuration: 7, floatDelay: 2, hideOnMobile: true },

  // Right cluster — slot machine, big die, chips, crown.
  { id: "slot-r", kind: "slotmachine", top: "8%", right: "-8%", width: 260, height: 340, depth: 0.2, rotate: 4, glow: "accent2", floatDuration: 14, floatDelay: 0.3, hideOnMobile: true },
  { id: "die-r1", kind: "die", top: "46%", right: "4%", width: 128, height: 128, depth: 0.34, rotate: -14, glow: "featured", floatDuration: 10, floatDelay: 1, hideOnTablet: true },
  { id: "chip-r1", kind: "chip", top: "30%", right: "16%", width: 78, height: 78, depth: 0.5, rotate: 0, glow: "featured", floatDuration: 7.5, floatDelay: 0.6 },
  { id: "chip-r2", kind: "chip", top: "66%", right: "10%", width: 58, height: 58, depth: 0.6, rotate: 0, glow: "accent2", floatDuration: 6, floatDelay: 1.8, hideOnMobile: true },
  { id: "crown-r", kind: "crown", top: "78%", right: "22%", width: 60, height: 42, depth: 0.65, rotate: 0, glow: "featured", floatDuration: 6.5, floatDelay: 0.9, hideOnMobile: true },
];

function ShapeSvg({ o, glowVar }: { o: SceneObject; glowVar: string }) {
  const c = `var(${glowVar})`;
  switch (o.kind) {
    case "card": {
      const pip = o.suit === "heart" ? "M50 34C38 20 16 26 16 46C16 66 50 88 50 88C50 88 84 66 84 46C84 26 62 20 50 34Z" : "M50 14C50 14 20 46 20 68C20 82 32 92 46 88C47.5 98 40 104 32 108H68C60 104 52.5 98 54 88C68 92 80 82 80 68C80 46 50 14 50 14Z";
      return (
        <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="94" height="134" rx="14" fill="rgba(10,6,20,0.55)" />
          <rect x="3" y="3" width="94" height="134" rx="14" stroke={c} strokeWidth="2.5" opacity="0.85" />
          <path d={pip} fill={c} opacity="0.9" transform="translate(0,4) scale(0.62) translate(30,32)" />
          <text x="16" y="26" fontSize="16" fontWeight="700" fill={c} opacity="0.85">A</text>
          <text x="84" y="122" fontSize="16" fontWeight="700" fill={c} opacity="0.85" transform="rotate(180 84 122)">A</text>
        </svg>
      );
    }
    case "chip":
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="47" fill="rgba(10,6,20,0.5)" />
          <circle cx="50" cy="50" r="46" stroke={c} strokeWidth="4" opacity="0.9" />
          <circle cx="50" cy="50" r="30" stroke={c} strokeWidth="2" opacity="0.7" />
          <circle cx="50" cy="50" r="14" fill={c} opacity="0.35" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = round(50 + Math.cos(angle) * 40);
            const y1 = round(50 + Math.sin(angle) * 40);
            const x2 = round(50 + Math.cos(angle) * 47);
            const y2 = round(50 + Math.sin(angle) * 47);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="5" strokeLinecap="round" opacity="0.9" />;
          })}
        </svg>
      );
    case "die":
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="92" height="92" rx="20" fill="rgba(10,6,20,0.55)" />
          <rect x="4" y="4" width="92" height="92" rx="20" stroke={c} strokeWidth="4" opacity="0.9" />
          <circle cx="28" cy="28" r="7" fill={c} />
          <circle cx="72" cy="28" r="7" fill={c} />
          <circle cx="28" cy="72" r="7" fill={c} />
          <circle cx="72" cy="72" r="7" fill={c} />
          <circle cx="50" cy="50" r="7" fill={c} />
        </svg>
      );
    case "slotmachine":
      return (
        <svg viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="128" height="168" rx="18" fill="rgba(10,6,20,0.6)" />
          <rect x="6" y="6" width="128" height="168" rx="18" stroke={c} strokeWidth="3" opacity="0.9" />
          <rect x="18" y="24" width="104" height="66" rx="8" fill="rgba(0,0,0,0.35)" stroke={c} strokeWidth="2" opacity="0.8" />
          <line x1="52" y1="24" x2="52" y2="90" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <line x1="88" y1="24" x2="88" y2="90" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <text x="35" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={c}>7</text>
          <text x="70" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={c} opacity="0.85">7</text>
          <text x="105" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={c} opacity="0.7">7</text>
          <circle cx="70" cy="112" r="16" fill="none" stroke={c} strokeWidth="3" opacity="0.85" />
          <circle cx="70" cy="112" r="6" fill={c} />
          <rect x="30" y="138" width="80" height="12" rx="6" fill={c} opacity="0.6" />
          <circle cx="128" cy="60" r="7" fill={c} opacity="0.9" />
          <rect x="122" y="60" width="8" height="70" rx="4" fill={c} opacity="0.9" />
        </svg>
      );
    case "crown":
      return (
        <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 60 L14 24 L32 42 L50 14 L68 42 L86 24 L92 60 Z" fill={c} opacity="0.3" />
          <path d="M8 60 L14 24 L32 42 L50 14 L68 42 L86 24 L92 60 Z" stroke={c} strokeWidth="4" strokeLinejoin="round" opacity="0.9" />
          <line x1="8" y1="60" x2="92" y2="60" stroke={c} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        </svg>
      );
    case "spade":
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 12C50 12 20 42 20 62C20 76 32 86 46 82C47.5 92 40 98 32 102H68C60 98 52.5 92 54 82C68 86 80 76 80 62C80 42 50 12 50 12Z"
            fill={c}
            opacity="0.65"
          />
        </svg>
      );
  }
}

export function CasinoScene({
  enabled,
  parallaxStrength,
}: {
  enabled: boolean;
  parallaxStrength: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useIsCoarsePointer();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const motionActive = enabled && !reducedMotion;
  const maxScrollPx = useMemo(() => parallaxRangeFor(parallaxStrength, 60), [parallaxStrength]);
  const maxMousePx = useMemo(() => parallaxRangeFor(parallaxStrength, 24), [parallaxStrength]);

  useEffect(() => {
    if (!motionActive) return;
    const el = containerRef.current;
    if (!el) return;

    function tick() {
      if (!el) return;
      const scrollNorm = clamp(scrollRef.current / 900, 0, 1);
      el.style.setProperty("--msb-scene-scroll", String(scrollNorm * maxScrollPx));
      el.style.setProperty("--msb-scene-mouse-x", String(mouseRef.current.x * maxMousePx));
      el.style.setProperty("--msb-scene-mouse-y", String(mouseRef.current.y * maxMousePx));
      rafRef.current = null;
    }

    function scheduleTick() {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    function onScroll() {
      scrollRef.current = window.scrollY;
      scheduleTick();
    }

    function onMouseMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current = { x: nx, y: ny };
      scheduleTick();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    if (!coarsePointer) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [motionActive, coarsePointer, maxScrollPx, maxMousePx]);

  if (!enabled) return null;

  const visibleObjects = SCENE_OBJECTS.filter((o) => {
    if (isMobile && o.hideOnMobile) return false;
    if (isTablet && o.hideOnTablet) return false;
    return true;
  });

  const glowVarFor = (glow: SceneObject["glow"]) =>
    glow === "accent" ? "--msb-accent" : glow === "accent2" ? "--msb-accent-2" : "--msb-featured";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="msb-scene pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ "--msb-scene-scroll": 0, "--msb-scene-mouse-x": 0, "--msb-scene-mouse-y": 0 } as React.CSSProperties}
    >
      <div className="msb-scene-glow msb-scene-glow-a" />
      <div className="msb-scene-glow msb-scene-glow-b" />
      <div className="msb-scene-glow msb-scene-glow-c" />

      {visibleObjects.map((o) => (
        <div
          key={o.id}
          className={`msb-scene-object ${motionActive ? "msb-scene-object-motion" : ""}`}
          style={
            {
              top: o.top,
              left: o.left,
              right: o.right,
              width: o.width,
              height: o.height,
              "--depth": o.depth,
              "--rotate": `${o.rotate}deg`,
            } as React.CSSProperties
          }
        >
          <div
            className={motionActive ? "msb-scene-float" : ""}
            style={{
              width: "100%",
              height: "100%",
              animationDuration: `${o.floatDuration}s`,
              animationDelay: `${o.floatDelay}s`,
              opacity: 0.85,
              filter: `drop-shadow(0 0 24px var(${glowVarFor(o.glow)}))`,
            }}
          >
            <ShapeSvg o={o} glowVar={glowVarFor(o.glow)} />
          </div>
        </div>
      ))}
    </div>
  );
}
