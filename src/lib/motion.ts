export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export type ParticleIntensity = "low" | "medium";

/**
 * Number of ambient particles to render for a given intensity/viewport.
 * Kept intentionally small — this is a decorative DOM particle system, not
 * a canvas/WebGL simulation, so counts stay low for performance.
 */
export function particleCountFor(intensity: ParticleIntensity, isMobile: boolean): number {
  if (isMobile) return intensity === "medium" ? 10 : 6;
  return intensity === "medium" ? 26 : 16;
}

/** Maps a 0-100 "strength" setting to a small px range used for parallax offsets. */
export function parallaxRangeFor(strengthPercent: number, maxPx: number): number {
  return (clamp(strengthPercent, 0, 100) / 100) * maxPx;
}
