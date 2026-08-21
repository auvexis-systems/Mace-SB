"use client";

import { useMemo } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/use-media";
import { particleCountFor, type ParticleIntensity } from "@/lib/motion";

type Particle = {
  id: number;
  top: number;
  left: number;
  size: number;
  color: "accent" | "accent2" | "featured";
  duration: number;
  pulseDuration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacityMax: number;
};

function buildParticles(count: number): Particle[] {
  const colors: Particle["color"][] = ["accent", "accent", "accent2", "featured"];
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random spread so server/client output stays stable.
    const seed = i * 137.508; // golden-angle spacing avoids visible clustering
    particles.push({
      id: i,
      top: (seed * 1.7) % 100,
      left: (seed * 0.9 + 13) % 100,
      size: 2 + (i % 4),
      color: colors[i % colors.length],
      duration: 8 + (i % 6) * 2,
      pulseDuration: 3 + (i % 5),
      delay: (i % 10) * 0.5,
      driftX: ((i % 3) - 1) * 16,
      driftY: (((i + 1) % 3) - 1) * 20,
      opacityMax: 0.35 + (i % 4) * 0.1,
    });
  }
  return particles;
}

const colorVar: Record<Particle["color"], string> = {
  accent: "var(--msb-accent)",
  accent2: "var(--msb-accent-2)",
  featured: "var(--msb-featured)",
};

export function ParticleField({
  enabled,
  intensity,
}: {
  enabled: boolean;
  intensity: ParticleIntensity;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const particles = useMemo(
    () => buildParticles(particleCountFor(intensity, isMobile)),
    [intensity, isMobile]
  );

  if (!enabled || reducedMotion) return null;

  return (
    <div className="msb-particle-field" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="msb-particle"
          style={
            {
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: colorVar[p.color],
              boxShadow: `0 0 ${p.size * 2}px ${colorVar[p.color]}`,
              "--msb-particle-duration": `${p.duration}s`,
              "--msb-particle-pulse-duration": `${p.pulseDuration}s`,
              "--msb-particle-delay": `${p.delay}s`,
              "--msb-particle-drift-x": `${p.driftX}px`,
              "--msb-particle-drift-y": `${p.driftY}px`,
              "--msb-particle-opacity-max": p.opacityMax,
              "--msb-particle-opacity-min": p.opacityMax * 0.3,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
